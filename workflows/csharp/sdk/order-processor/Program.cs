using Dapr.Client;
using Dapr.Workflow;
using WorkflowConsoleApp.Activities;
using WorkflowConsoleApp.Models;
using WorkflowConsoleApp.Workflows;
using System.Text.Json;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;

const string workflowComponent = "dapr";
const string storeName = "statestore";
const string workflowName = nameof(OrderProcessingWorkflow);

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

// Start the client
string daprPortStr = Environment.GetEnvironmentVariable("DAPR_GRPC_PORT");
if (string.IsNullOrEmpty(daprPortStr))
{
    Environment.SetEnvironmentVariable("DAPR_GRPC_PORT", "4001");
}
using var daprClient = new DaprClientBuilder().Build();

// Start the console app
while (true)
{
    var health = await daprClient.CheckHealthAsync();
    Console.WriteLine("Welcome to the workflows example!");
    Console.WriteLine("In this example, you will be starting a workflow and obtaining the status.");

    // Populate the store with items
    RestockInventory();

    // Can we remove the logging info?
    
    // Main Loop
    // Generate a unique ID for the workflow
    string orderId = Guid.NewGuid().ToString()[..8];
    string itemToPurchase = "Cars";
    int ammountToPurchase = 10;
    Console.WriteLine("In this quickstart, you will be purhasing {0} {1}.", ammountToPurchase, itemToPurchase);

    // Construct the order
    OrderPayload orderInfo = new OrderPayload(itemToPurchase, 15000, ammountToPurchase);

    OrderPayload orderResponse;
    string key;
    // Ensure that the store has items
    (orderResponse, key) = await daprClient.GetStateAndETagAsync<OrderPayload>(storeName, itemToPurchase);

    // Start the workflow
    Console.WriteLine("Starting workflow {0} purchasing {1} {2}", orderId, ammountToPurchase, itemToPurchase);
    var response = await daprClient.StartWorkflowAsync(orderId, workflowComponent, workflowName, orderInfo, null, CancellationToken.None);

    // Wait a second to allow workflow to start
    await Task.Delay(TimeSpan.FromSeconds(1));

    var state = await daprClient.GetWorkflowAsync(orderId, workflowComponent, workflowName);
    Console.WriteLine("Your workflow has started. Here is the status of the workflow: {0}", state);
    while (state.metadata["dapr.workflow.runtime_status"].ToString() == "RUNNING")
    {
        await Task.Delay(TimeSpan.FromSeconds(5));
        state = await daprClient.GetWorkflowAsync(orderId, workflowComponent, workflowName);
    }
        Console.WriteLine("Your workflow has completed: {0}", JsonSerializer.Serialize(state));
        Console.WriteLine("Workflow Status: {0}", state.metadata["dapr.workflow.runtime_status"]);
    
    break;
}

void RestockInventory()
{
    daprClient.SaveStateAsync<OrderPayload>(storeName, "Cars",  new OrderPayload(Name: "Cars", TotalCost: 15000, Quantity: 100));
    return;
}
