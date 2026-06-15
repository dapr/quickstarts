// ------------------------------------------------------------------------
// Copyright 2026 The Dapr Authors
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//     http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ------------------------------------------------------------------------

namespace PatientIntake;

using Dapr.Workflow;

// ---------------------------------------------------------------------------
// PatientIntake (root workflow)
// ---------------------------------------------------------------------------

public sealed class PatientIntakeWorkflow : Workflow<PatientRecord, string>
{
    public override async Task<string> RunAsync(WorkflowContext ctx, PatientRecord rec)
    {
        if (!ctx.IsReplaying)
            Console.WriteLine($"  [PatientIntake] Starting intake for patient {rec.PatientId}");

        // Step 1: Verify insurance — no propagation (plain activity).
        if (!ctx.IsReplaying)
            Console.WriteLine("  [PatientIntake] Step 1: VerifyInsurance (no propagation)");
        var insured = await ctx.CallActivityAsync<bool>(
            nameof(VerifyInsuranceActivity),
            rec);
        if (!insured)
            return "intake declined: insurance not on file";
        if (!ctx.IsReplaying)
            Console.WriteLine("  [PatientIntake] Step 1 complete: insurance verified");

        // Step 2: Delegate to PrescribeMedication with Lineage propagation.
        // PrescribeMedication inherits this workflow's full history so its own
        // grandchild ComplianceAudit can verify the complete ancestor chain.
        if (!ctx.IsReplaying)
            Console.WriteLine("  [PatientIntake] Step 2: PrescribeMedication child wf (HistoryPropagationScope.Lineage)");
        var result = await ctx.CallChildWorkflowAsync<string>(
            nameof(PrescribeMedicationWorkflow),
            rec,
            new ChildWorkflowTaskOptions(PropagationScope: HistoryPropagationScope.Lineage));

        if (!ctx.IsReplaying)
            Console.WriteLine($"  [PatientIntake] COMPLETE: {result}");
        return result;
    }
}

// ---------------------------------------------------------------------------
// PrescribeMedication (child workflow, level 2)
// ---------------------------------------------------------------------------

public sealed class PrescribeMedicationWorkflow : Workflow<PatientRecord, string>
{
    public override async Task<string> RunAsync(WorkflowContext ctx, PatientRecord rec)
    {
        if (!ctx.IsReplaying)
            Console.WriteLine($"  [PrescribeMedication] Starting prescription: {rec.Medication} {rec.Dosage:F0}mg for {rec.Condition}");

        // Step 1: Allergy check (no propagation).
        if (!ctx.IsReplaying)
            Console.WriteLine("  [PrescribeMedication] Step 1: CheckAllergies (no propagation)");
        var allergyClear = await ctx.CallActivityAsync<bool>(
            nameof(CheckAllergiesActivity),
            rec);
        if (!allergyClear)
            return "prescription declined: known allergy";
        if (!ctx.IsReplaying)
            Console.WriteLine("  [PrescribeMedication] Step 1 complete: allergy clear");

        // Step 2: Drug interaction screen (no propagation).
        if (!ctx.IsReplaying)
            Console.WriteLine("  [PrescribeMedication] Step 2: ScreenDrugInteractions (no propagation)");
        var interactionsClear = await ctx.CallActivityAsync<bool>(
            nameof(ScreenDrugInteractionsActivity),
            rec);
        if (!interactionsClear)
            return "prescription declined: drug interaction risk";
        if (!ctx.IsReplaying)
            Console.WriteLine("  [PrescribeMedication] Step 2 complete: no interactions");

        // Step 3: Compliance audit grandchild workflow with Lineage propagation.
        // ComplianceAudit will see both PatientIntake AND PrescribeMedication events.
        if (!ctx.IsReplaying)
            Console.WriteLine("  [PrescribeMedication] Step 3: ComplianceAudit child wf (HistoryPropagationScope.Lineage)");
        var audit = await ctx.CallChildWorkflowAsync<ComplianceResult>(
            nameof(ComplianceAuditWorkflow),
            rec,
            new ChildWorkflowTaskOptions(PropagationScope: HistoryPropagationScope.Lineage));
        if (!audit.Compliant)
            return $"prescription blocked: compliance audit failed (risk={audit.RiskScore:F2}, reason={audit.Reason})";
        if (!ctx.IsReplaying)
            Console.WriteLine($"  [PrescribeMedication] Step 3 complete: compliance audit passed (risk={audit.RiskScore:F2})");

        // Step 4: Dispense the medication via a child workflow.
        // In the happy path we attach OwnHistory propagation — the pharmacy
        // receives PrescribeMedication's own events only (no ancestral chain)
        // and can verify that the allergy and interaction screens ran. In the
        // negative scenario (rec.ForwardLineage == false) we deliberately omit
        // propagation, so the pharmacy receives no lineage and refuses.
        if (!ctx.IsReplaying)
        {
            Console.WriteLine("  [PrescribeMedication] Step 4: DispenseMedicationWorkflow child wf");
            Console.WriteLine(rec.ForwardLineage
                ? "                        -> HistoryPropagationScope.OwnHistory"
                : "                        -> NO history propagation (negative scenario)");
        }
        var dispense = await (rec.ForwardLineage
            ? ctx.CallChildWorkflowAsync<DispenseResult>(
                nameof(DispenseMedicationWorkflow),
                rec,
                new ChildWorkflowTaskOptions(PropagationScope: HistoryPropagationScope.OwnHistory))
            : ctx.CallChildWorkflowAsync<DispenseResult>(
                nameof(DispenseMedicationWorkflow),
                rec));

        if (dispense.Status != "dispensed")
        {
            if (!ctx.IsReplaying)
                Console.WriteLine($"  [PrescribeMedication] Step 4 BLOCKED: pharmacy refused to dispense ({dispense.Reason})");
            return $"prescription not dispensed: pharmacy refused ({dispense.Reason})";
        }
        if (!ctx.IsReplaying)
            Console.WriteLine($"  [PrescribeMedication] Step 4 complete: dispensed (id={dispense.DispenseId}, {dispense.EventCount} events verified)");

        var summary = $"dispensed: id={dispense.DispenseId}, patient={rec.PatientId}, drug={rec.Medication} {rec.Dosage:F0}mg";
        if (!ctx.IsReplaying)
            Console.WriteLine($"  [PrescribeMedication] COMPLETE: {summary}");
        return summary;
    }
}

// ---------------------------------------------------------------------------
// ComplianceAudit (grandchild workflow, level 3)
// ---------------------------------------------------------------------------

public sealed class ComplianceAuditWorkflow : Workflow<PatientRecord, ComplianceResult>
{
    public override Task<ComplianceResult> RunAsync(WorkflowContext ctx, PatientRecord rec)
    {
        if (!ctx.IsReplaying)
            Console.WriteLine($"  [ComplianceAudit] Auditing prescription for patient {rec.PatientId}");

        var history = ctx.GetPropagatedHistory();
        if (history is null)
        {
            if (!ctx.IsReplaying)
            {
                Console.WriteLine("  [ComplianceAudit] WARNING: no propagated history — sidecar may not support 1.18+");
                Console.WriteLine("  [ComplianceAudit] BLOCKED — cannot verify upstream pipeline without history");
            }
            return Task.FromResult(new ComplianceResult(
                Compliant: false,
                RiskScore: 1.0,
                Reason: "no execution history provided — cannot verify caller pipeline",
                EventCount: 0));
        }

        if (!ctx.IsReplaying)
        {
            Console.WriteLine($"  [ComplianceAudit] Received propagated history with {history.Entries.Count} segment(s):");
            foreach (var entry in history.Entries)
                Console.WriteLine($"  [ComplianceAudit]   workflow: name={entry.WorkflowName} app={entry.AppId} events={entry.Events.Count}");
        }

        // Verify PatientIntake is present in the ancestor chain.
        var intakeEntries = history.FilterByWorkflowName(nameof(PatientIntakeWorkflow));
        if (intakeEntries.Entries.Count == 0)
        {
            return Task.FromResult(new ComplianceResult(
                Compliant: false,
                RiskScore: 0.9,
                Reason: $"{nameof(PatientIntakeWorkflow)} missing from propagated history",
                EventCount: history.Entries.Count));
        }

        // Verify PrescribeMedication is present in the ancestor chain.
        var prescribeEntries = history.FilterByWorkflowName(nameof(PrescribeMedicationWorkflow));
        if (prescribeEntries.Entries.Count == 0)
        {
            return Task.FromResult(new ComplianceResult(
                Compliant: false,
                RiskScore: 0.9,
                Reason: $"{nameof(PrescribeMedicationWorkflow)} missing from propagated history",
                EventCount: history.Entries.Count));
        }

        // Verify the required activity completions are recorded in history events.
        var intakeEntry = intakeEntries.Entries[0];
        var prescribeEntry = prescribeEntries.Entries[0];

        int intakeCompletedCount = intakeEntry.Events.Count(e => e.Kind == HistoryEventKind.TaskCompleted);
        int prescribeCompletedCount = prescribeEntry.Events.Count(e => e.Kind == HistoryEventKind.TaskCompleted);

        if (!ctx.IsReplaying)
        {
            Console.WriteLine("  [ComplianceAudit] Verification:");
            Console.WriteLine($"    PatientIntake       TaskCompleted events: {intakeCompletedCount} (expect >= 1: VerifyInsurance)");
            Console.WriteLine($"    PrescribeMedication TaskCompleted events: {prescribeCompletedCount} (expect >= 2: CheckAllergies, ScreenDrugInteractions)");
        }

        if (intakeCompletedCount == 0 || prescribeCompletedCount < 2)
        {
            if (!ctx.IsReplaying)
                Console.WriteLine("  [ComplianceAudit] BLOCKED — required upstream checks not completed");
            return Task.FromResult(new ComplianceResult(
                Compliant: false,
                RiskScore: 0.9,
                Reason: "required upstream checks not completed in propagated history",
                EventCount: history.Entries.Count));
        }

        int totalEventCount = history.Entries.Sum(e => e.Events.Count);
        double riskScore = rec.Dosage > 1000 ? 0.3 : 0.1;
        if (!ctx.IsReplaying)
            Console.WriteLine($"  [ComplianceAudit] APPROVED (risk={riskScore:F2}, total events inspected={totalEventCount})");

        return Task.FromResult(new ComplianceResult(
            Compliant: true,
            RiskScore: riskScore,
            Reason: "all upstream checks verified in propagated history",
            EventCount: totalEventCount));
    }
}

// ---------------------------------------------------------------------------
// DispenseMedicationWorkflow (grandchild workflow, level 3)
// ---------------------------------------------------------------------------

public sealed class DispenseMedicationWorkflow : Workflow<PatientRecord, DispenseResult>
{
    public override async Task<DispenseResult> RunAsync(WorkflowContext ctx, PatientRecord rec)
    {
        var history = ctx.GetPropagatedHistory();

        if (!ctx.IsReplaying)
            Console.WriteLine($"  [DispenseMedication] Dispense request: {rec.Medication} {rec.Dosage:F0}mg for {rec.PatientId} (propagated history: {DescribeHistory(history)})");

        // Pharmacy policy: no lineage, no dispense. Without propagated history the
        // pharmacy cannot prove the prescription was screened, so it refuses.
        if (history is null)
        {
            if (!ctx.IsReplaying)
                Console.WriteLine($"  [DispenseMedication] REFUSED — no propagated history; cannot verify screening for {rec.PatientId}");
            return new DispenseResult(
                DispenseId: "",
                Status: "refused",
                EventCount: 0,
                Reason: "missing lineage: no propagated history received from prescriber");
        }

        int eventCount = history.Entries.Sum(e => e.Events.Count);

        if (!ctx.IsReplaying)
        {
            // With OwnHistory only PrescribeMedication appears here — not PatientIntake.
            foreach (var entry in history.Entries)
                Console.WriteLine($"  [DispenseMedication]   workflow: name={entry.WorkflowName} app={entry.AppId} events={entry.Events.Count}");
        }

        // Verify the prescriber's own history is present and shows both screens
        // completed (CheckAllergies + ScreenDrugInteractions == 2 TaskCompleted).
        var prescribeEntries = history.FilterByWorkflowName(nameof(PrescribeMedicationWorkflow));
        if (prescribeEntries.Entries.Count == 0)
        {
            if (!ctx.IsReplaying)
                Console.WriteLine($"  [DispenseMedication] REFUSED — propagated history is missing the PrescribeMedication lineage for {rec.PatientId}");
            return new DispenseResult(
                DispenseId: "",
                Status: "refused",
                EventCount: eventCount,
                Reason: "missing lineage: PrescribeMedication not present in propagated history");
        }

        int screensCompleted = prescribeEntries.Entries[0].Events.Count(e => e.Kind == HistoryEventKind.TaskCompleted);
        if (screensCompleted < 2)
        {
            if (!ctx.IsReplaying)
                Console.WriteLine($"  [DispenseMedication] REFUSED — required screening not verified in propagated history for {rec.PatientId}");
            return new DispenseResult(
                DispenseId: "",
                Status: "refused",
                EventCount: eventCount,
                Reason: "missing lineage: allergy/interaction screening not verified in propagated history");
        }

        var result = await ctx.CallActivityAsync<DispenseResult>(
            nameof(DispenseMedicationActivity),
            rec);

        return result with { EventCount = eventCount };
    }

    private static string DescribeHistory(PropagatedHistory? history) =>
        history is null ? "none" : $"{history.Entries.Sum(e => e.Events.Count)} events";
}
