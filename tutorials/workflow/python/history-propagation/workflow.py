# -*- coding: utf-8 -*-
# Copyright 2026 The Dapr Authors
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Workflow + activity definitions for the history propagation quickstart.

PatientIntake (root workflow)
  |- VerifyInsurance      (activity, no propagation)
  `- PrescribeMedication  (child workflow, PropagationScope.LINEAGE)
        |- CheckAllergies         (activity, no propagation)
        |- ScreenDrugInteractions (activity, no propagation)
        |- ComplianceAudit        (grandchild wf, PropagationScope.LINEAGE)
        |     reads: PatientIntake/VerifyInsurance
        |            PrescribeMedication/CheckAllergies
        |            PrescribeMedication/ScreenDrugInteractions
        `- DispenseMedication     (activity, PropagationScope.OWN_HISTORY
                                   when forward_lineage=True, else no propagation)
              reads: PrescribeMedication events only (no PatientIntake chain)
"""

from __future__ import annotations

import time

import dapr.ext.workflow as wf

from models import ComplianceResult, DispenseResult, PatientRecord

wfr = wf.WorkflowRuntime()


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _describe_scope(scope: wf.PropagationScope | None) -> str:
    if scope is None:
        return 'NONE'
    return scope.name


def _describe_history(history: wf.PropagatedHistory | None) -> str:
    if history is None:
        return 'none'
    return f'{len(history.events)} events, scope={_describe_scope(history.scope)}'


# ---------------------------------------------------------------------------
# Activities
# ---------------------------------------------------------------------------


@wfr.activity(name='VerifyInsurance')
def verify_insurance(ctx: wf.WorkflowActivityContext, rec_json: str) -> bool:
    rec = PatientRecord.from_json(rec_json)
    print(f'  [VerifyInsurance] Checking coverage for patient {rec.patient_id}', flush=True)
    return True


@wfr.activity(name='CheckAllergies')
def check_allergies(ctx: wf.WorkflowActivityContext, rec_json: str) -> bool:
    rec = PatientRecord.from_json(rec_json)
    history = ctx.get_propagated_history()
    print(
        f'  [CheckAllergies] Screening {rec.patient_id} for {rec.medication} '
        f'(propagated history: {_describe_history(history)})',
        flush=True,
    )
    return True


@wfr.activity(name='ScreenDrugInteractions')
def screen_drug_interactions(ctx: wf.WorkflowActivityContext, rec_json: str) -> bool:
    rec = PatientRecord.from_json(rec_json)
    history = ctx.get_propagated_history()
    print(
        f'  [ScreenDrugInteractions] Screening {rec.medication} {rec.dosage:.0f}mg '
        f'for {rec.patient_id} (propagated history: {_describe_history(history)})',
        flush=True,
    )
    return True


@wfr.activity(name='DispenseMedication')
def dispense_medication(ctx: wf.WorkflowActivityContext, rec_json: str) -> str:
    """Refuses to dispense unless the propagated history proves screening ran."""
    rec = PatientRecord.from_json(rec_json)
    history = ctx.get_propagated_history()
    print(
        f'  [DispenseMedication] Dispense request: {rec.medication} {rec.dosage:.0f}mg '
        f'for {rec.patient_id} (propagated history: {_describe_history(history)})',
        flush=True,
    )

    if history is None:
        print(
            f'  [DispenseMedication] REFUSED — no propagated history; '
            f'cannot verify screening for {rec.patient_id}',
            flush=True,
        )
        refused = DispenseResult(
            dispense_id='',
            status='refused',
            reason='missing lineage: no propagated history received from prescriber',
            event_count=0,
        )
        return refused.to_json()

    event_count = len(history.events)
    print(f'  [DispenseMedication] Apps in chain: {history.get_app_ids()}', flush=True)
    for wf_result in history.get_workflows():
        print(
            f'  [DispenseMedication]   workflow: app={wf_result.app_id}, '
            f'name={wf_result.name}, instance={wf_result.instance_id}',
            flush=True,
        )

    try:
        prescribe_wf = history.get_last_workflow_by_name('PrescribeMedication')
    except wf.PropagationNotFoundError:
        print(
            f'  [DispenseMedication] REFUSED — propagated history is missing the '
            f'PrescribeMedication lineage for {rec.patient_id}',
            flush=True,
        )
        refused = DispenseResult(
            dispense_id='',
            status='refused',
            reason='missing lineage: PrescribeMedication not present in propagated history',
            event_count=event_count,
        )
        return refused.to_json()

    try:
        allergies_act = prescribe_wf.get_last_activity_by_name('CheckAllergies')
        interactions_act = prescribe_wf.get_last_activity_by_name('ScreenDrugInteractions')
    except wf.PropagationNotFoundError:
        print(
            f'  [DispenseMedication] REFUSED — required screening not verified in '
            f'propagated history for {rec.patient_id}',
            flush=True,
        )
        refused = DispenseResult(
            dispense_id='',
            status='refused',
            reason='missing lineage: allergy/interaction screening not verified in propagated history',
            event_count=event_count,
        )
        return refused.to_json()

    if not (allergies_act.completed and interactions_act.completed):
        print(
            f'  [DispenseMedication] REFUSED — required screening not verified in '
            f'propagated history for {rec.patient_id}',
            flush=True,
        )
        refused = DispenseResult(
            dispense_id='',
            status='refused',
            reason='missing lineage: allergy/interaction screening not verified in propagated history',
            event_count=event_count,
        )
        return refused.to_json()

    dispense_id = f'rx-{rec.patient_id}-{int(time.time() * 1000)}'
    print(f'  [DispenseMedication] DISPENSED: {dispense_id}', flush=True)
    dispensed = DispenseResult(
        dispense_id=dispense_id,
        status='dispensed',
        reason='',
        event_count=event_count,
    )
    return dispensed.to_json()


# ---------------------------------------------------------------------------
# Child workflows
# ---------------------------------------------------------------------------


@wfr.workflow(name='ComplianceAudit')
def compliance_audit(ctx: wf.DaprWorkflowContext, rec_json: str):
    """Approves only if the propagated history shows insurance + screening completed."""
    rec = PatientRecord.from_json(rec_json)
    if not ctx.is_replaying:
        print(
            f'  [ComplianceAudit] Auditing prescription for patient {rec.patient_id}',
            flush=True,
        )

    history = ctx.get_propagated_history()
    if history is None:
        if not ctx.is_replaying:
            print('  [ComplianceAudit] WARNING: No propagated history received!', flush=True)
            print(
                '  [ComplianceAudit] BLOCKED — cannot verify upstream pipeline without history',
                flush=True,
            )
        no_history = ComplianceResult(
            compliant=False,
            risk_score=1.0,
            reason='no execution history provided — cannot verify caller pipeline',
            event_count=0,
        )
        return no_history.to_json()

    if not ctx.is_replaying:
        print(
            f'  [ComplianceAudit] Received propagated history: '
            f'{len(history.events)} events (scope: {_describe_scope(history.scope)})',
            flush=True,
        )
        print(f'  [ComplianceAudit] Apps in chain: {history.get_app_ids()}', flush=True)
        for wf_result in history.get_workflows():
            print(
                f'  [ComplianceAudit]   workflow: app={wf_result.app_id}, '
                f'name={wf_result.name}, instance={wf_result.instance_id}',
                flush=True,
            )

    try:
        intake_wf = history.get_last_workflow_by_name('PatientIntake')
        prescribe_wf = history.get_last_workflow_by_name('PrescribeMedication')
        insurance = intake_wf.get_last_activity_by_name('VerifyInsurance')
        allergies = prescribe_wf.get_last_activity_by_name('CheckAllergies')
        interactions = prescribe_wf.get_last_activity_by_name('ScreenDrugInteractions')
    except wf.PropagationNotFoundError as exc:
        if not ctx.is_replaying:
            print(f'  [ComplianceAudit] BLOCKED — {exc}', flush=True)
        missing = ComplianceResult(
            compliant=False,
            risk_score=0.9,
            reason=f'required item missing from propagated history: {exc}',
            event_count=len(history.events),
        )
        return missing.to_json()

    if not ctx.is_replaying:
        print('  [ComplianceAudit] Verification:', flush=True)
        print(
            f'  [ComplianceAudit]   PatientIntake/VerifyInsurance: '
            f'completed={insurance.completed}',
            flush=True,
        )
        print(
            f'  [ComplianceAudit]   PrescribeMedication/CheckAllergies: '
            f'completed={allergies.completed}',
            flush=True,
        )
        print(
            f'  [ComplianceAudit]   PrescribeMedication/ScreenDrugInteractions: '
            f'completed={interactions.completed}',
            flush=True,
        )

    all_completed = insurance.completed and allergies.completed and interactions.completed
    if not all_completed:
        if not ctx.is_replaying:
            print(
                '  [ComplianceAudit] BLOCKED — required upstream checks not completed',
                flush=True,
            )
        blocked = ComplianceResult(
            compliant=False,
            risk_score=0.9,
            reason='required upstream checks not completed in propagated history',
            event_count=len(history.events),
        )
        return blocked.to_json()

    risk_score = 0.3 if rec.dosage > 1000 else 0.1
    if not ctx.is_replaying:
        print(f'  [ComplianceAudit] APPROVED (risk={risk_score:.2f})', flush=True)
    approved = ComplianceResult(
        compliant=True,
        risk_score=risk_score,
        reason='all upstream checks verified in propagated history',
        event_count=len(history.events),
    )
    return approved.to_json()


@wfr.workflow(name='PrescribeMedication')
def prescribe_medication(ctx: wf.DaprWorkflowContext, rec_json: str):
    rec = PatientRecord.from_json(rec_json)
    if not ctx.is_replaying:
        print(
            f'  [PrescribeMedication] Starting prescription: {rec.medication} '
            f'{rec.dosage:.0f}mg for {rec.condition}',
            flush=True,
        )

    if not ctx.is_replaying:
        print(
            '  [PrescribeMedication] Step 1: CallActivity(CheckAllergies) — no propagation',
            flush=True,
        )
    allergy_clear = yield ctx.call_activity(check_allergies, input=rec_json)
    if not allergy_clear:
        return 'prescription declined: known allergy'
    if not ctx.is_replaying:
        print('  [PrescribeMedication] Step 1 complete: allergy clear', flush=True)

    if not ctx.is_replaying:
        print(
            '  [PrescribeMedication] Step 2: CallActivity(ScreenDrugInteractions) '
            '— no propagation',
            flush=True,
        )
    interactions_clear = yield ctx.call_activity(screen_drug_interactions, input=rec_json)
    if not interactions_clear:
        return 'prescription declined: drug interaction risk'
    if not ctx.is_replaying:
        print('  [PrescribeMedication] Step 2 complete: no interactions', flush=True)

    if not ctx.is_replaying:
        print(
            '  [PrescribeMedication] Step 3: CallChildWorkflow(ComplianceAudit)',
            flush=True,
        )
        print(
            '                        -> propagation=PropagationScope.LINEAGE',
            flush=True,
        )
    audit_json = yield ctx.call_child_workflow(
        compliance_audit,
        input=rec_json,
        propagation=wf.PropagationScope.LINEAGE,
    )
    audit = ComplianceResult.from_json(audit_json)
    if not audit.compliant:
        return (
            f'prescription blocked: compliance audit failed '
            f'(risk={audit.risk_score:.2f}, reason={audit.reason})'
        )
    if not ctx.is_replaying:
        print(
            f'  [PrescribeMedication] Step 3 complete: compliance audit passed '
            f'(risk={audit.risk_score:.2f}, {audit.event_count} events verified)',
            flush=True,
        )

    # Step 4 demonstrates the two propagation modes side-by-side: forward_lineage=True
    # attaches OWN_HISTORY so the pharmacy can verify upstream screening;
    # forward_lineage=False omits propagation, so the pharmacy refuses to dispense.
    if not ctx.is_replaying:
        print(
            '  [PrescribeMedication] Step 4: CallActivity(DispenseMedication)',
            flush=True,
        )
        if rec.forward_lineage:
            print(
                '                        -> propagation=PropagationScope.OWN_HISTORY',
                flush=True,
            )
        else:
            print(
                '                        -> NO history propagation (negative scenario)',
                flush=True,
            )
    if rec.forward_lineage:
        dispense_json = yield ctx.call_activity(
            dispense_medication,
            input=rec_json,
            propagation=wf.PropagationScope.OWN_HISTORY,
        )
    else:
        dispense_json = yield ctx.call_activity(dispense_medication, input=rec_json)
    dispense = DispenseResult.from_json(dispense_json)
    if dispense.status != 'dispensed':
        if not ctx.is_replaying:
            print(
                f'  [PrescribeMedication] Step 4 BLOCKED: pharmacy refused to dispense '
                f'({dispense.reason})',
                flush=True,
            )
        return f'prescription not dispensed: pharmacy refused ({dispense.reason})'
    if not ctx.is_replaying:
        print(
            f'  [PrescribeMedication] Step 4 complete: dispensed '
            f'(id={dispense.dispense_id}, {dispense.event_count} events verified)',
            flush=True,
        )

    result = (
        f'dispensed: id={dispense.dispense_id}, patient={rec.patient_id}, '
        f'drug={rec.medication} {rec.dosage:.0f}mg'
    )
    if not ctx.is_replaying:
        print(f'  [PrescribeMedication] COMPLETE: {result}', flush=True)
    return result


@wfr.workflow(name='PatientIntake')
def patient_intake(ctx: wf.DaprWorkflowContext, rec_json: str):
    rec = PatientRecord.from_json(rec_json)
    if not ctx.is_replaying:
        print(f'  [PatientIntake] Starting intake for patient {rec.patient_id}', flush=True)
        print(
            '  [PatientIntake] Step 1: CallActivity(VerifyInsurance) — no propagation',
            flush=True,
        )
    insured = yield ctx.call_activity(verify_insurance, input=rec_json)
    if not insured:
        return 'intake declined: insurance not on file'
    if not ctx.is_replaying:
        print('  [PatientIntake] Step 1 complete: insurance verified', flush=True)
        print('  [PatientIntake] Step 2: CallChildWorkflow(PrescribeMedication)', flush=True)
        print(
            '                  -> propagation=PropagationScope.LINEAGE',
            flush=True,
        )
    result = yield ctx.call_child_workflow(
        prescribe_medication,
        input=rec_json,
        propagation=wf.PropagationScope.LINEAGE,
    )
    if not ctx.is_replaying:
        print(f'  [PatientIntake] COMPLETE: {result}', flush=True)
    return result
