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

// Workflow History Propagation Quickstart (.NET SDK)
//
// Scenario: credit-card payment processing with fraud detection.
//
// Flow:
//   MerchantCheckout (root)
//     └─ ValidateMerchant     (activity, no propagation)
//     └─ ProcessPayment       (child wf, HistoryPropagationScope.Lineage)
//           └─ ValidateCard           (activity, no propagation)
//           └─ CheckSpendingLimits    (activity, no propagation)
//           └─ FraudDetection         (grandchild wf, HistoryPropagationScope.Lineage)
//           |      reads: MerchantCheckout + ProcessPayment events
//           └─ SettlePayment          (activity, HistoryPropagationScope.OwnHistory)
//                  reads: ProcessPayment events only
//
// Requires Dapr 1.18+ (dapr/dapr#9810) and Dapr.Workflow 1.18+ (dapr/dotnet-sdk#1802).
// Against an older sidecar GetPropagatedHistory() returns null and the sample
// exits gracefully.

using Dapr.Client;
using Dapr.Workflow;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OrderProcessor;

const string Banner =
    "============================================\n" +
    "= WORKFLOW HISTORY PROPAGATION DEMO (.NET) =\n" +
    "============================================";

// ---------------------------------------------------------------------------
// Host setup — register workflows and activities
// ---------------------------------------------------------------------------

var builder = Host.CreateDefaultBuilder(args)
    .ConfigureServices(services =>
    {
        services.AddDaprClient();
        services.AddDaprWorkflow(options =>
        {
            options.RegisterWorkflow<MerchantCheckoutWorkflow>();
            options.RegisterWorkflow<ProcessPaymentWorkflow>();
            options.RegisterWorkflow<FraudDetectionWorkflow>();
            options.RegisterWorkflow<SettlementWorkflow>();

            options.RegisterActivity<ValidateMerchantActivity>();
            options.RegisterActivity<ValidateCardActivity>();
            options.RegisterActivity<CheckSpendingLimitsActivity>();
            options.RegisterActivity<SettlePaymentActivity>();
        });
    });

using var host = builder.Build();
host.Start();

var workflowClient = host.Services.GetRequiredService<DaprWorkflowClient>();

// ---------------------------------------------------------------------------
// Kick off the root workflow
// ---------------------------------------------------------------------------

Console.WriteLine(Banner);
Console.WriteLine();
Console.WriteLine("  Flow: MerchantCheckout -> ValidateMerchant");
Console.WriteLine("           -> ProcessPayment (child wf, Lineage)");
Console.WriteLine("               -> ValidateCard -> CheckSpendingLimits");
Console.WriteLine("               -> FraudDetection (child wf, Lineage)    <-- sees MerchantCheckout + ProcessPayment events");
Console.WriteLine("               -> SettlePayment  (activity, OwnHistory)  <-- sees only ProcessPayment events");
Console.WriteLine();

var request = new PaymentRequest(
    CardLast4: "4242",
    Amount: 149.99,
    Currency: "USD",
    MerchantId: "merchant-abc",
    Description: "Online purchase");

const string InstanceId = "checkout-001";

Console.WriteLine($"  [main] Scheduling workflow instance: {InstanceId}");

await workflowClient.ScheduleNewWorkflowAsync(
    name: nameof(MerchantCheckoutWorkflow),
    instanceId: InstanceId,
    input: request);

var state = await workflowClient.WaitForWorkflowCompletionAsync(
    instanceId: InstanceId,
    cancellationToken: new CancellationTokenSource(TimeSpan.FromSeconds(30)).Token);

if (state is null)
{
    Console.WriteLine("  [main] Workflow not found!");
}
else if (state.RuntimeStatus == WorkflowRuntimeStatus.Completed)
{
    Console.WriteLine($"  [main] Workflow completed! Output: {state.SerializedOutput}");
}
else
{
    Console.WriteLine($"  [main] Workflow ended with status: {state.RuntimeStatus}");
}

Console.WriteLine();
Console.WriteLine("============================================");
Console.WriteLine("=               COMPLETE                  =");
Console.WriteLine("============================================");
