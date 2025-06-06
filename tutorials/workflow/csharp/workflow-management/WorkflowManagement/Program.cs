using Dapr.Workflow;
using WorkflowManagement;
using WorkflowManagement.Activities;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow(options =>
{
    options.RegisterWorkflow<NeverEndingWorkflow>();
    options.RegisterActivity<SendNotification>();
});
var app = builder.Build();

app.MapPost("/start/{counter}", async (
    int counter,
    DaprWorkflowClient workflowClient) =>
{
    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(NeverEndingWorkflow),
        input: counter);

    return Results.Accepted(instanceId);
});

app.MapGet("/status/{instanceId}", async (
    string instanceId,
    DaprWorkflowClient workflowClient) =>
{
    try
    {
        var workflowStatus = await workflowClient.GetWorkflowStateAsync(instanceId);
        return Results.Ok(workflowStatus);
    }
    catch (Exception ex)
    {
        return Results.NotFound(ex.Message);
    }
});

app.MapPost("/suspend/{instanceId}", async (
    string instanceId,
    DaprWorkflowClient workflowClient) =>
{
    await workflowClient.SuspendWorkflowAsync(instanceId);

    return Results.Accepted();
});

app.MapPost("/resume/{instanceId}", async (
    string instanceId,
    DaprWorkflowClient workflowClient) =>
{
    await workflowClient.ResumeWorkflowAsync(instanceId);

    return Results.Accepted();
});

app.MapPost("/terminate/{instanceId}", async (
    string instanceId,
    DaprWorkflowClient workflowClient) =>
{
    await workflowClient.TerminateWorkflowAsync(instanceId);

    return Results.Accepted();
});

app.MapDelete("/purge/{instanceId}", async (
    string instanceId,
    DaprWorkflowClient workflowClient) =>
{
    var result = await workflowClient.PurgeInstanceAsync(instanceId);

    return Results.Ok(result);
});

app.Run();