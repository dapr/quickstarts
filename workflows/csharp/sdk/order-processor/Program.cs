using Dapr.StateManagement.Extensions;
using Dapr.Workflow;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using WorkflowConsoleApp.Models;
using WorkflowConsoleApp.Models.State;
using WorkflowConsoleApp.Workflows;

// The workflow host is a background service that connects to the sidecar over gRPC
using var host = Host.CreateDefaultBuilder(args)
    .ConfigureLogging(logging => logging
        // Keep the console to the order lines: hide the SDK, HTTP client and gRPC client info lines
        .AddFilter("System.Net.Http.HttpClient", LogLevel.Warning)
        .AddFilter("Grpc.Net.Client", LogLevel.Critical)
        .AddFilter("Dapr.Workflow", LogLevel.Warning)
        // Ctrl+C closes the sidecar connection, and the worker logs that as an error with a stack trace
        .AddFilter("Dapr.Workflow.Worker", LogLevel.Critical)
        .AddFilter("Microsoft.Hosting.Lifetime", LogLevel.Warning))
    .ConfigureServices(services =>
    {
        services.AddDaprStateManagementClient()
            .WithInventoryStore();
        services.AddDaprWorkflow();
    }).Build();

// Start the app - this is the point where we connect to the Dapr sidecar
host.Start();

// Ctrl+C cancels this token, so the app stops while it waits for the workflow
var stopping = host.Services.GetRequiredService<IHostApplicationLifetime>().ApplicationStopping;
var workflowClient = host.Services.GetRequiredService<DaprWorkflowClient>();

// The workflow instance ID is the order ID. Set ORDER_ID to use the same instance again after a restart
var orderId = Environment.GetEnvironmentVariable("ORDER_ID");
if (string.IsNullOrWhiteSpace(orderId))
{
    orderId = $"order-{DateTime.Now:yyyyMMdd-HHmmss}";
}

const string itemToPurchase = "Cars";
const int amountToPurchase = 2;
const double pricePerItem = 5000;

Console.WriteLine($"Order ID: {orderId}");

try
{
    // Populate the store with items only when the inventory is not there yet, so a restart does not restock
    var stateStore = host.Services.GetRequiredService<IInventoryStore>();
    var (inventory, _) = await stateStore.GetStateAndETagAsync<OrderPayload>(itemToPurchase, cancellationToken: stopping);
    if (inventory is null)
    {
        await stateStore.SaveStateAsync(itemToPurchase, new OrderPayload(Name: itemToPurchase, TotalCost: 50000, Quantity: 10), cancellationToken: stopping);
    }

    // Check if the workflow instance exists already
    var existing = await workflowClient.GetWorkflowStateAsync(orderId, getInputsAndOutputs: false, cancellation: stopping);
    if (existing is { Exists: true })
    {
        if (existing.RuntimeStatus is WorkflowRuntimeStatus.Completed or WorkflowRuntimeStatus.Failed or WorkflowRuntimeStatus.Terminated)
        {
            // The workflow ended already, so there is nothing to wait for
            Console.WriteLine($"Workflow completed: {existing.RuntimeStatus.ToString().ToUpperInvariant()}");
            return;
        }

        Console.WriteLine($"Order {orderId} is already running. Waiting for it to finish.");
    }
    else
    {
        // Construct the order: 2 cars at 5000 each. A total over 5000 needs an approval
        var orderInfo = new OrderPayload(itemToPurchase, pricePerItem * amountToPurchase, amountToPurchase);

        await workflowClient.ScheduleNewWorkflowAsync(
            name: nameof(OrderProcessingWorkflow),
            instanceId: orderId,
            input: orderInfo,
            startTime: null,
            cancellation: stopping);

        Console.WriteLine($"Started order {orderId}.");
    }

    // Wait for the workflow to finish. The approval timeout is 10 minutes, so wait longer than that
    using var timeout = CancellationTokenSource.CreateLinkedTokenSource(stopping);
    timeout.CancelAfter(TimeSpan.FromMinutes(15));
    var state = await workflowClient.WaitForWorkflowCompletionAsync(
        instanceId: orderId,
        getInputsAndOutputs: false,
        cancellation: timeout.Token);

    Console.WriteLine($"Workflow completed: {state.RuntimeStatus.ToString().ToUpperInvariant()}");
}
catch (OperationCanceledException)
{
    // Ctrl+C or the 15 minute wait ended. The workflow keeps its state in the state store
}
