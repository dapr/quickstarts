using Dapr.Workflow;
using Microsoft.AspNetCore.Mvc;
using TaskChaining;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow();
var app = builder.Build();

app.MapPost("/start", async ([FromServices] DaprWorkflowClient workflowClient) =>
{
    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(ChainingWorkflow),
        input: "This");

    return Results.Accepted(instanceId);
});

app.Run();
