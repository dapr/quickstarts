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

namespace OrderProcessor;

using Dapr.Workflow;

// ---------------------------------------------------------------------------
// PatientIntake (root workflow)
// ---------------------------------------------------------------------------

/// <summary>
/// Root workflow — verifies the patient's insurance then delegates the
/// prescription to a child workflow with full
/// <see cref="HistoryPropagationScope.Lineage"/> propagation so the grandchild
/// ComplianceAudit can inspect the complete ancestor chain.
/// </summary>
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

/// <summary>
/// Child workflow — orchestrates allergy + interaction screening, compliance
/// audit, and dispensing. Receives <see cref="HistoryPropagationScope.Lineage"/>
/// from PatientIntake, so it holds the full ancestor chain when calling its
/// own children. Calls ComplianceAudit with Lineage (audit needs to see the
/// grandparent) and DispenseMedicationWorkflow with OwnHistory (pharmacy only
/// sees the prescribing step, not the intake).
/// </summary>
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

        // Step 4: Dispense the medication as a child workflow with OwnHistory propagation.
        // DispenseMedicationWorkflow only sees PrescribeMedication's own events — not PatientIntake.
        // Note: the .NET SDK propagation support is on ChildWorkflowTaskOptions only.
        // For a trust-boundary demo equivalent to PropagationScope.OWN_HISTORY in Python/Go,
        // DispenseMedication is implemented as a child workflow (not a bare activity).
        if (!ctx.IsReplaying)
            Console.WriteLine("  [PrescribeMedication] Step 4: DispenseMedicationWorkflow child wf (HistoryPropagationScope.OwnHistory)");
        var dispense = await ctx.CallChildWorkflowAsync<DispenseResult>(
            nameof(DispenseMedicationWorkflow),
            rec,
            new ChildWorkflowTaskOptions(PropagationScope: HistoryPropagationScope.OwnHistory));
        if (!ctx.IsReplaying)
            Console.WriteLine($"  [PrescribeMedication] Step 4 complete: dispensed (id={dispense.DispenseId})");

        var summary = $"dispensed: id={dispense.DispenseId}, patient={rec.PatientId}, drug={rec.Medication} {rec.Dosage:F0}mg";
        if (!ctx.IsReplaying)
            Console.WriteLine($"  [PrescribeMedication] COMPLETE: {summary}");
        return summary;
    }
}

// ---------------------------------------------------------------------------
// ComplianceAudit (grandchild workflow, level 3)
// ---------------------------------------------------------------------------

/// <summary>
/// Grandchild workflow that inspects the full ancestor chain to make a
/// trust-aware compliance decision. Receives <see cref="HistoryPropagationScope.Lineage"/>
/// from PrescribeMedication, so <see cref="WorkflowContext.GetPropagatedHistory"/>
/// returns entries for both PatientIntake and PrescribeMedication. Refuses to
/// approve dispensing unless the required upstream steps (insurance, allergies,
/// drug interactions) are all present and completed in the propagated history.
/// </summary>
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

/// <summary>
/// Dispense workflow — receives <see cref="HistoryPropagationScope.OwnHistory"/>
/// from PrescribeMedication, so it can only see PrescribeMedication's own events.
/// This demonstrates the trust-boundary mode: the PatientIntake ancestor history
/// is intentionally excluded — the pharmacy system doesn't need (or get to see)
/// the upstream patient-intake chain.
/// </summary>
/// <remarks>
/// In the Python sibling and the Go reference this is implemented as a bare
/// activity because those SDKs support a propagation argument on activity calls.
/// The .NET SDK's <see cref="HistoryPropagationScope"/> is currently scoped to
/// child workflows only (<see cref="ChildWorkflowTaskOptions"/>), so we use a
/// child workflow here to demonstrate the identical OwnHistory boundary.
/// </remarks>
public sealed class DispenseMedicationWorkflow : Workflow<PatientRecord, DispenseResult>
{
    public override async Task<DispenseResult> RunAsync(WorkflowContext ctx, PatientRecord rec)
    {
        var history = ctx.GetPropagatedHistory();

        int eventCount = 0;
        if (history is not null)
        {
            eventCount = history.Entries.Sum(e => e.Events.Count);
            if (!ctx.IsReplaying)
            {
                Console.WriteLine($"  [DispenseMedicationWorkflow] Propagated segments: {history.Entries.Count}");
                foreach (var entry in history.Entries)
                {
                    Console.WriteLine($"  [DispenseMedicationWorkflow]   workflow: name={entry.WorkflowName} app={entry.AppId} events={entry.Events.Count}");
                    foreach (var evt in entry.Events.Take(5))
                        Console.WriteLine($"  [DispenseMedicationWorkflow]     event: kind={evt.Kind} id={evt.EventId}");
                    if (entry.Events.Count > 5)
                        Console.WriteLine($"  [DispenseMedicationWorkflow]     ... ({entry.Events.Count - 5} more events)");
                }

                // With OwnHistory, PatientIntake should NOT appear here.
                var intakeEntries = history.FilterByWorkflowName(nameof(PatientIntakeWorkflow));
                Console.WriteLine($"  [DispenseMedicationWorkflow] PatientIntake in history (expected 0): {intakeEntries.Entries.Count}");
            }
        }
        else if (!ctx.IsReplaying)
        {
            Console.WriteLine("  [DispenseMedicationWorkflow] No propagated history received");
        }

        var result = await ctx.CallActivityAsync<DispenseResult>(
            nameof(DispenseMedicationActivity),
            rec);

        return result with { EventCount = eventCount };
    }
}
