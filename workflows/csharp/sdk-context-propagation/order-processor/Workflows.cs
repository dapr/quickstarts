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
// MerchantCheckout (root workflow)
// ---------------------------------------------------------------------------

/// <summary>
/// Root workflow — validates the merchant then delegates payment to a child
/// workflow with full <see cref="HistoryPropagationScope.Lineage"/> propagation
/// so the grandchild FraudDetection can inspect the complete ancestor chain.
/// </summary>
public sealed class MerchantCheckoutWorkflow : Workflow<PaymentRequest, string>
{
    public override async Task<string> RunAsync(WorkflowContext ctx, PaymentRequest req)
    {
        Console.WriteLine($"  [MerchantCheckout] Starting checkout for merchant {req.MerchantId}");

        // Step 1: Validate merchant — no propagation (plain activity).
        Console.WriteLine("  [MerchantCheckout] Step 1: ValidateMerchant (no propagation)");
        await ctx.CallActivityAsync<bool>(
            nameof(ValidateMerchantActivity),
            req);
        Console.WriteLine("  [MerchantCheckout] Step 1 complete: merchant valid");

        // Step 2: Delegate to ProcessPayment with Lineage propagation.
        // ProcessPayment inherits this workflow's full history so that its own
        // child FraudDetection can verify the complete ancestor chain.
        Console.WriteLine("  [MerchantCheckout] Step 2: ProcessPayment child wf (HistoryPropagationScope.Lineage)");
        var result = await ctx.CallChildWorkflowAsync<string>(
            nameof(ProcessPaymentWorkflow),
            req,
            new ChildWorkflowTaskOptions(PropagationScope: HistoryPropagationScope.Lineage));

        Console.WriteLine($"  [MerchantCheckout] COMPLETE: {result}");
        return result;
    }
}

// ---------------------------------------------------------------------------
// ProcessPayment (child workflow, level 2)
// ---------------------------------------------------------------------------

/// <summary>
/// Child workflow — orchestrates card validation, fraud detection, and
/// settlement. Receives <see cref="HistoryPropagationScope.Lineage"/> from
/// MerchantCheckout, so it holds the full ancestor chain when calling its
/// own children.
/// </summary>
public sealed class ProcessPaymentWorkflow : Workflow<PaymentRequest, string>
{
    public override async Task<string> RunAsync(WorkflowContext ctx, PaymentRequest req)
    {
        Console.WriteLine($"  [ProcessPayment] Starting payment ****{req.CardLast4} {req.Amount} {req.Currency}");

        // Step 1: Validate card (no propagation).
        Console.WriteLine("  [ProcessPayment] Step 1: ValidateCard (no propagation)");
        var cardValid = await ctx.CallActivityAsync<bool>(
            nameof(ValidateCardActivity),
            req);
        if (!cardValid)
            return "payment declined: invalid card";
        Console.WriteLine("  [ProcessPayment] Step 1 complete: card valid");

        // Step 2: Check spending limits (no propagation).
        Console.WriteLine("  [ProcessPayment] Step 2: CheckSpendingLimits (no propagation)");
        var withinLimits = await ctx.CallActivityAsync<bool>(
            nameof(CheckSpendingLimitsActivity),
            req);
        if (!withinLimits)
            return "payment declined: spending limit exceeded";
        Console.WriteLine("  [ProcessPayment] Step 2 complete: within limits");

        // Step 3: Fraud detection grandchild workflow with Lineage propagation.
        // FraudDetection will see both MerchantCheckout AND ProcessPayment events.
        Console.WriteLine("  [ProcessPayment] Step 3: FraudDetection child wf (HistoryPropagationScope.Lineage)");
        var fraudResult = await ctx.CallChildWorkflowAsync<FraudCheckResult>(
            nameof(FraudDetectionWorkflow),
            req,
            new ChildWorkflowTaskOptions(PropagationScope: HistoryPropagationScope.Lineage));
        if (!fraudResult.Approved)
            return $"payment declined: fraud check failed (risk={fraudResult.RiskScore:F2}, reason={fraudResult.Reason})";
        Console.WriteLine($"  [ProcessPayment] Step 3 complete: fraud check passed (risk={fraudResult.RiskScore:F2})");

        // Step 4: Settle payment as a child workflow with OwnHistory propagation.
        // SettlementWorkflow only sees ProcessPayment's own events — not MerchantCheckout.
        // Note: the .NET SDK propagation support is on ChildWorkflowTaskOptions only.
        // For a trust-boundary demo equivalent to PropagationScope.OWN_HISTORY in Python,
        // SettlePayment is implemented as a child workflow (not a bare activity).
        Console.WriteLine("  [ProcessPayment] Step 4: SettlementWorkflow child wf (HistoryPropagationScope.OwnHistory)");
        var settlement = await ctx.CallChildWorkflowAsync<SettlementResult>(
            nameof(SettlementWorkflow),
            req,
            new ChildWorkflowTaskOptions(PropagationScope: HistoryPropagationScope.OwnHistory));
        Console.WriteLine($"  [ProcessPayment] Step 4 complete: settled (txn={settlement.TransactionId})");

        var summary = $"payment settled: txn={settlement.TransactionId}, " +
                      $"card=****{req.CardLast4}, amount={req.Amount} {req.Currency}";
        Console.WriteLine($"  [ProcessPayment] COMPLETE: {summary}");
        return summary;
    }
}

// ---------------------------------------------------------------------------
// FraudDetection (grandchild workflow, level 3)
// ---------------------------------------------------------------------------

/// <summary>
/// Grandchild workflow that inspects the full ancestor chain to make a
/// trust-aware fraud decision. Receives <see cref="HistoryPropagationScope.Lineage"/>
/// from ProcessPayment, so <see cref="WorkflowContext.GetPropagatedHistory"/> returns
/// entries for both MerchantCheckout and ProcessPayment.
/// </summary>
public sealed class FraudDetectionWorkflow : Workflow<PaymentRequest, FraudCheckResult>
{
    public override Task<FraudCheckResult> RunAsync(WorkflowContext ctx, PaymentRequest req)
    {
        Console.WriteLine($"  [FraudDetection] Checking payment ****{req.CardLast4} {req.Amount} {req.Currency}");

        var history = ctx.GetPropagatedHistory();
        if (history is null)
        {
            Console.WriteLine("  [FraudDetection] WARNING: no propagated history — sidecar may not support 1.18+");
            return Task.FromResult(new FraudCheckResult(
                RiskScore: 1.0,
                Approved: false,
                Reason: "no execution history provided — cannot verify caller pipeline",
                EventCount: 0));
        }

        Console.WriteLine($"  [FraudDetection] Received propagated history with {history.Entries.Count} segment(s):");
        foreach (var entry in history.Entries)
            Console.WriteLine($"  [FraudDetection]   workflow: name={entry.WorkflowName} app={entry.AppId} events={entry.Events.Count}");

        // Verify MerchantCheckout is present in the ancestor chain.
        var merchantEntries = history.FilterByWorkflowName(nameof(MerchantCheckoutWorkflow));
        if (merchantEntries.Entries.Count == 0)
        {
            return Task.FromResult(new FraudCheckResult(
                RiskScore: 0.9,
                Approved: false,
                Reason: $"{nameof(MerchantCheckoutWorkflow)} missing from propagated history",
                EventCount: history.Entries.Count));
        }

        // Verify ProcessPayment is present in the ancestor chain.
        var processEntries = history.FilterByWorkflowName(nameof(ProcessPaymentWorkflow));
        if (processEntries.Entries.Count == 0)
        {
            return Task.FromResult(new FraudCheckResult(
                RiskScore: 0.9,
                Approved: false,
                Reason: $"{nameof(ProcessPaymentWorkflow)} missing from propagated history",
                EventCount: history.Entries.Count));
        }

        // Verify the required activity completions are recorded in history events.
        var merchantEntry = merchantEntries.Entries[0];
        var processEntry = processEntries.Entries[0];

        int merchantCompletedCount = merchantEntry.Events.Count(e => e.Kind == HistoryEventKind.TaskCompleted);
        int processCompletedCount  = processEntry.Events.Count(e => e.Kind == HistoryEventKind.TaskCompleted);

        Console.WriteLine("  [FraudDetection] Verification:");
        Console.WriteLine($"    MerchantCheckout TaskCompleted events: {merchantCompletedCount}");
        Console.WriteLine($"    ProcessPayment   TaskCompleted events: {processCompletedCount}");

        if (merchantCompletedCount == 0 || processCompletedCount == 0)
        {
            return Task.FromResult(new FraudCheckResult(
                RiskScore: 0.9,
                Approved: false,
                Reason: "required upstream checks not completed in propagated history",
                EventCount: history.Entries.Count));
        }

        int totalEventCount = history.Entries.Sum(e => e.Events.Count);
        double riskScore = req.Amount > 1000 ? 0.3 : 0.1;
        Console.WriteLine($"  [FraudDetection] APPROVED (risk={riskScore:F2}, total events inspected={totalEventCount})");

        return Task.FromResult(new FraudCheckResult(
            RiskScore: riskScore,
            Approved: true,
            Reason: "all upstream checks verified in propagated history",
            EventCount: totalEventCount));
    }
}

// ---------------------------------------------------------------------------
// SettlementWorkflow (grandchild workflow, level 3)
// ---------------------------------------------------------------------------

/// <summary>
/// Settlement workflow — receives <see cref="HistoryPropagationScope.OwnHistory"/>
/// from ProcessPayment, so it can only see ProcessPayment's own events.
/// This demonstrates the trust-boundary mode: the MerchantCheckout ancestor
/// history is intentionally excluded.
/// </summary>
/// <remarks>
/// In the Python sibling this is implemented as a bare activity because the
/// Python SDK supports <c>propagation=</c> on <c>call_activity()</c>. The .NET
/// SDK's <see cref="HistoryPropagationScope"/> is currently scoped to child
/// workflows only (<see cref="ChildWorkflowTaskOptions"/>), so we use a child
/// workflow here to demonstrate the identical OwnHistory boundary.
/// </remarks>
public sealed class SettlementWorkflow : Workflow<PaymentRequest, SettlementResult>
{
    public override async Task<SettlementResult> RunAsync(WorkflowContext ctx, PaymentRequest req)
    {
        var history = ctx.GetPropagatedHistory();

        int eventCount = 0;
        if (history is not null)
        {
            eventCount = history.Entries.Sum(e => e.Events.Count);
            Console.WriteLine($"  [SettlementWorkflow] Propagated segments: {history.Entries.Count}");
            foreach (var entry in history.Entries)
                Console.WriteLine($"  [SettlementWorkflow]   workflow: name={entry.WorkflowName} app={entry.AppId} events={entry.Events.Count}");

            // With OwnHistory, MerchantCheckout should NOT appear here.
            var merchantEntries = history.FilterByWorkflowName(nameof(MerchantCheckoutWorkflow));
            Console.WriteLine($"  [SettlementWorkflow] MerchantCheckout in history (expected 0): {merchantEntries.Entries.Count}");
        }
        else
        {
            Console.WriteLine("  [SettlementWorkflow] No propagated history received");
        }

        var result = await ctx.CallActivityAsync<SettlementResult>(
            nameof(SettlePaymentActivity),
            req);

        Console.WriteLine($"  [SettlementWorkflow] SETTLED: {result.TransactionId}");
        return result with { EventCount = eventCount };
    }
}
