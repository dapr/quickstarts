using Dapr.Client;
using Dapr.Workflow;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using WorkflowConsoleApp.Activities;
using WorkflowConsoleApp.Models;
using WorkflowConsoleApp.Workflows;

const string storeName = "statestore";

// The workflow host is a background service that connects to the sidecar over gRPC
var builder = Host.CreateDefaultBuilder(args).ConfigureServices(services =>
{
    services.AddDaprClient();
    services.AddDaprWorkflow(options =>
    {
        // Note that it's also possible to register a lambda function as the workflow
        // or activity implementation instead of a class.
        options.RegisterWorkflow<OrderProcessingWorkflow>();

        // These are the activities that get invoked by the workflow(s).
        options.RegisterActivity<NotifyActivity>();
        options.RegisterActivity<VerifyInventoryActivity>();
        options.RegisterActivity<RequestApprovalActivity>();
        options.RegisterActivity<ProcessPaymentActivity>();
        options.RegisterActivity<UpdateInventoryActivity>();
    });
});

// Start the app - this is the point where we connect to the Dapr sidecar
using var host = builder.Build();
host.Start();

var daprClient = host.Services.GetRequiredService<DaprClient>();
var workflowClient = host.Services.GetRequiredService<DaprWorkflowClient>();

// Generate a unique ID for the workflow
var orderId = Guid.NewGuid().ToString()[..8];
const string itemToPurchase = "Cars";
const int amountToPurchase = 1;

// Populate the store with items
RestockInventory(itemToPurchase);

// Construct the order
var orderInfo = new OrderPayload(itemToPurchase, 5000, amountToPurchase);

// Start the workflow
Console.WriteLine($"Starting workflow {orderId} purchasing {amountToPurchase} {itemToPurchase}");

await workflowClient.ScheduleNewWorkflowAsync(
    name: nameof(OrderProcessingWorkflow),
    instanceId: orderId,
    input: orderInfo);

// Wait for the workflow to start and confirm the input
var state = await workflowClient.WaitForWorkflowStartAsync(
    instanceId: orderId);

Console.WriteLine($"Your workflow has started. Here is the status of the workflow: {Enum.GetName(typeof(WorkflowRuntimeStatus), state.RuntimeStatus)}");

// Wait for the workflow to complete
state = await workflowClient.WaitForWorkflowCompletionAsync(
    instanceId: orderId);

Console.WriteLine("Workflow Status: {0}", Enum.GetName(typeof(WorkflowRuntimeStatus), state.RuntimeStatus));
return;

void RestockInventory(string itemToPurchase)
{
    daprClient.SaveStateAsync(storeName, itemToPurchase, new OrderPayload(Name: itemToPurchase, TotalCost: 50000, Quantity: 10));
}
