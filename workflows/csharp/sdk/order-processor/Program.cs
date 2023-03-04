using Dapr.Client;
using Dapr.Workflow;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System;
using WorkflowConsoleApp.Activities;
using WorkflowConsoleApp.Models;
using WorkflowConsoleApp.Workflows;

const string storeName = "statestore";

// The workflow host is a background service that connects to the sidecar over gRPC
var builder = Host.CreateDefaultBuilder(args).ConfigureServices(services =>
{
    services.AddDaprWorkflow(options =>
    {
        // Note that it's also possible to register a lambda function as the workflow
        // or activity implementation instead of a class.
        options.RegisterWorkflow<OrderProcessingWorkflow>();

        // These are the activities that get invoked by the workflow(s).
        options.RegisterActivity<NotifyActivity>();
        options.RegisterActivity<ReserveInventoryActivity>();
        options.RegisterActivity<ProcessPaymentActivity>();
        options.RegisterActivity<UpdateInventoryActivity>();
    });
});

// Start the app - this is the point where we connect to the Dapr sidecar
using var host = builder.Build();
host.Start();

using var daprClient = new DaprClientBuilder().Build();

// NOTE: WorkflowEngineClient will be replaced with a richer version of DaprClient
//       in a subsequent SDK release. This is a temporary workaround.
WorkflowEngineClient workflowClient = host.Services.GetRequiredService<WorkflowEngineClient>();

// Populate the store with items
RestockInventory();

// Generate a unique ID for the workflow
string orderId = Guid.NewGuid().ToString()[..8];
string itemToPurchase = "Cars";
int ammountToPurchase = 10;

// Construct the order
OrderPayload orderInfo = new OrderPayload(itemToPurchase, 15000, ammountToPurchase);

// Start the workflow
Console.WriteLine("Starting workflow {0} purchasing {1} {2}", orderId, ammountToPurchase, itemToPurchase);

await workflowClient.ScheduleNewWorkflowAsync(
    name: nameof(OrderProcessingWorkflow),
    instanceId: orderId,
    input: orderInfo);

// Wait a second to allow workflow to start
await Task.Delay(TimeSpan.FromSeconds(1));

WorkflowState state = await workflowClient.GetWorkflowStateAsync(
    instanceId: orderId,
    getInputsAndOutputs: true);

Console.WriteLine("Your workflow has started. Here is the status of the workflow: {0}", state.RuntimeStatus);
while (!state.IsWorkflowCompleted)
{
    await Task.Delay(TimeSpan.FromSeconds(5));
    state = await workflowClient.GetWorkflowStateAsync(
        instanceId: orderId,
        getInputsAndOutputs: true);
}

Console.WriteLine("Workflow Status: {0}", state.RuntimeStatus);

void RestockInventory()
{
    daprClient.SaveStateAsync<OrderPayload>(storeName, "Cars",  new OrderPayload(Name: "Cars", TotalCost: 15000, Quantity: 100));
    return;
}
