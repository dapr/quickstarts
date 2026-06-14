using ChildWorkflows;
using Dapr.Workflow;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow();
var app = builder.Build();

app.MapPost("/start", async (
    string[] input,
    [FromServices] DaprWorkflowClient workflowClient) =>
{
    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(ParentWorkflow),
        input: input);

    return Results.Accepted(instanceId);
});

app.Run();
