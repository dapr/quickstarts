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

"""Workflow history propagation quickstart — patient intake / e-prescribing.

A root PatientIntake workflow orders a prescription via a child
PrescribeMedication workflow, which in turn runs a ComplianceAudit child
workflow and a DispenseMedication activity. The compliance audit and the
dispensing step inspect the propagated execution history of their callers
to verify that the required upstream checks (insurance, allergies, drug
interactions) actually ran before they make a decision.

Two scenarios are scheduled back-to-back:
  1. Lineage forwarded   — PrescribeMedication propagates its history to
                            DispenseMedication; the pharmacy dispenses.
  2. Lineage withheld    — PrescribeMedication does NOT propagate history;
                            the pharmacy refuses to dispense.

Both workflows run to completion and have their state purged so the app
exits on its own — no Ctrl+C needed.
"""

from __future__ import annotations

import dapr.ext.workflow as wf

from models import PatientRecord
from workflow import patient_intake, wfr


def _banner(msg: str) -> str:
    line = '=' * (len(msg) + 4)
    return f'{line}\n= {msg} =\n{line}'


def _run_scenario(client: wf.DaprWorkflowClient, title: str, instance_id: str, rec: PatientRecord) -> None:
    """Schedule one PatientIntake run, wait for it, print the result, purge state."""
    print(flush=True)
    print(_banner(title), flush=True)

    started_id = client.schedule_new_workflow(
        workflow=patient_intake,
        input=rec.to_json(),
        instance_id=instance_id,
    )
    print(f'  [main] Started workflow: {started_id}', flush=True)

    state = client.wait_for_workflow_completion(
        instance_id=started_id,
        timeout_in_seconds=30,
    )
    if state is None:
        print('  [main] Workflow not found!', flush=True)
        return
    if state.runtime_status.name != 'COMPLETED':
        print(
            f'  [main] Workflow ended with status: {state.runtime_status.name}',
            flush=True,
        )
    else:
        print(f'  [main] Result: {state.serialized_output}', flush=True)

    try:
        client.purge_workflow(started_id)
    except Exception as exc:
        print(f'  [main] failed to purge: {exc}', flush=True)


def main() -> None:
    wfr.start()

    print(_banner('WORKFLOW HISTORY PROPAGATION DEMO — PATIENT INTAKE'), flush=True)
    print(flush=True)
    print('  Flow: PatientIntake -> VerifyInsurance', flush=True)
    print('           -> PrescribeMedication (child wf, lineage)', flush=True)
    print('               -> CheckAllergies -> ScreenDrugInteractions', flush=True)
    print(
        '               -> ComplianceAudit (child wf, lineage)     '
        '<-- sees PatientIntake + PrescribeMedication events',
        flush=True,
    )
    print(
        '               -> DispenseMedication (activity, own only) '
        '<-- sees only PrescribeMedication events',
        flush=True,
    )

    client = wf.DaprWorkflowClient()

    # Scenario 1 (happy path): PrescribeMedication forwards its own history to
    # the pharmacy, which verifies the upstream screening and dispenses.
    _run_scenario(
        client,
        'SCENARIO 1: lineage forwarded — pharmacy dispenses',
        'intake-ok',
        PatientRecord(
            patient_id='P-1042',
            name='Jane Doe',
            dob='1985-06-12',
            mrn='MRN-77231',
            condition='bacterial sinusitis',
            medication='amoxicillin',
            dosage=500,
            forward_lineage=True,
        ),
    )

    # Scenario 2 (negative): PrescribeMedication dispenses WITHOUT propagating
    # its history, so the pharmacy receives no lineage and refuses to dispense.
    _run_scenario(
        client,
        'SCENARIO 2: lineage withheld — pharmacy refuses',
        'intake-missing-lineage',
        PatientRecord(
            patient_id='P-2087',
            name='John Roe',
            dob='1979-03-04',
            mrn='MRN-55810',
            condition='strep throat',
            medication='penicillin',
            dosage=500,
            forward_lineage=False,
        ),
    )

    print(flush=True)
    print(_banner('COMPLETE'), flush=True)

    client.close()
    wfr.shutdown()


if __name__ == '__main__':
    main()
