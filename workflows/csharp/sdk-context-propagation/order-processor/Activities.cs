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

/// <summary>
/// Validates the merchant account. Called by MerchantCheckout without propagation.
/// </summary>
public sealed class ValidateMerchantActivity : WorkflowActivity<PaymentRequest, bool>
{
    public override Task<bool> RunAsync(WorkflowActivityContext ctx, PaymentRequest req)
    {
        Console.WriteLine($"  [ValidateMerchant] Validating merchant {req.MerchantId}");
        return Task.FromResult(true);
    }
}

/// <summary>
/// Validates the payment card. Called by ProcessPayment without propagation.
/// </summary>
public sealed class ValidateCardActivity : WorkflowActivity<PaymentRequest, bool>
{
    public override Task<bool> RunAsync(WorkflowActivityContext ctx, PaymentRequest req)
    {
        Console.WriteLine($"  [ValidateCard] Validating card ****{req.CardLast4}");
        return Task.FromResult(true);
    }
}

/// <summary>
/// Checks that the payment amount is within card spending limits.
/// Called by ProcessPayment without propagation.
/// </summary>
public sealed class CheckSpendingLimitsActivity : WorkflowActivity<PaymentRequest, bool>
{
    public override Task<bool> RunAsync(WorkflowActivityContext ctx, PaymentRequest req)
    {
        Console.WriteLine($"  [CheckSpendingLimits] Checking {req.Amount} {req.Currency}");
        bool withinLimits = req.Amount <= 10_000;
        Console.WriteLine($"  [CheckSpendingLimits] Within limits: {withinLimits}");
        return Task.FromResult(withinLimits);
    }
}

/// <summary>
/// Executes the final payment settlement. Called by SettlementWorkflow.
/// </summary>
public sealed class SettlePaymentActivity : WorkflowActivity<PaymentRequest, SettlementResult>
{
    public override Task<SettlementResult> RunAsync(WorkflowActivityContext ctx, PaymentRequest req)
    {
        var txnId = $"txn-{req.MerchantId}-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}";
        Console.WriteLine($"  [SettlePayment] SETTLED: {txnId}");
        return Task.FromResult(new SettlementResult(
            TransactionId: txnId,
            Status: "settled",
            EventCount: 0)); // EventCount populated by SettlementWorkflow
    }
}
