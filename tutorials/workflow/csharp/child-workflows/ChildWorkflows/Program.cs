using Dapr.Workflow;
using ChildWorkflows;
using ChildWorkflows.Activities;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow(options => {
    options.RegisterWorkflow<ParentWorkflow>();
    options.RegisterWorkflow<ChildWorkflow>();
    options.RegisterActivity<Activity1>();
    options.RegisterActivity<Activity2>();
});
var app = builder.Build();

app.MapPost("/start", async (string[] input) => {
    await using var scope  = app.Services.CreateAsyncScope();
    var workflowClient = scope.ServiceProvider.GetRequiredService<DaprWorkflowClient>();

    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(ParentWorkflow),
        input: input);

    return Results.Accepted(instanceId);
});

app.Run();
