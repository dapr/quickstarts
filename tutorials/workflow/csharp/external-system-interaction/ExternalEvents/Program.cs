using Dapr.Workflow;
using ExternalEvents;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow();
var app = builder.Build();

app.MapPost("/start", async (
    Order order,
    [FromServices] DaprWorkflowClient workflowClient) =>
{
    Console.WriteLine($"Received order: {order}.");

    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(ExternalEventsWorkflow),
        instanceId: order.Id,
        input: order);

    return Results.Accepted(instanceId);
});

app.Run();

internal sealed record Order(string Id, string Description, int Quantity, double TotalPrice);
