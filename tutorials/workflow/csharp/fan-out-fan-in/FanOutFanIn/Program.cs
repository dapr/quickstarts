using Dapr.Workflow;
using FanOutFanIn;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow();
var app = builder.Build();

app.MapPost("/start", async (
    string[] words,
    [FromServices] DaprWorkflowClient workflowClient) =>
{
    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(FanOutFanInWorkflow),
        input: words);

    return Results.Accepted(instanceId);
});

app.Run();
