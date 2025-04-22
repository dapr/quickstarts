using Dapr.Workflow;
using TaskChaining;
using TaskChaining.Activities;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow(options =>
{
    options.RegisterWorkflow<ChainingWorkflow>();
    options.RegisterActivity<Activity1>();
    options.RegisterActivity<Activity2>();
    options.RegisterActivity<Activity3>();
});
var app = builder.Build();

app.MapPost("/start", async (DaprWorkflowClient workflowClient) =>
{
    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(ChainingWorkflow),
        input: "This");

    return Results.Accepted(instanceId);
});

app.Run();
