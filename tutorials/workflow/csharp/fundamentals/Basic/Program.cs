using Basic;
using Dapr.Workflow;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
// Dapr Workflows and Activities are automatically discovered and registered with this line.
builder.Services.AddDaprWorkflow();
var app = builder.Build();

app.MapPost("/start/{input}", async (
    string input,
    [FromServices] DaprWorkflowClient workflowClient) =>
{
    /// The DaprWorkflowClient is the API to manage workflows.
    /// Here it is used to schedule a new workflow instance.
    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(BasicWorkflow),
        input: input);

    return Results.Accepted(instanceId);
});

app.Run();
