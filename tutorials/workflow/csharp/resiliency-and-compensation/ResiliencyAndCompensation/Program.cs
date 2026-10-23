using Dapr.Workflow;
using Microsoft.AspNetCore.Mvc;
using ResiliencyAndCompensation;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow();
var app = builder.Build();

app.MapPost("/start/{input}", async (
    int input,
    [FromServices] DaprWorkflowClient workflowClient) =>
{
    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(ResiliencyAndCompensationWorkflow),
        input: input);

    return Results.Accepted(instanceId);
});

app.Run();
