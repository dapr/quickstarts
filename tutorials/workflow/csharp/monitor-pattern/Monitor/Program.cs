using Dapr.Workflow;
using Microsoft.AspNetCore.Mvc;
using Monitor;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow();
var app = builder.Build();

app.MapPost("/start/{counter}", async (
    int counter,
    [FromServices] DaprWorkflowClient workflowClient) =>
{
    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(MonitorWorkflow),
        input: counter);

    return Results.Accepted(instanceId);
});

app.Run();
