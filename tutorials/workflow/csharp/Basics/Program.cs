using Dapr.Workflow;
using TaskChaining;
using TaskChaining.Activities;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow(options => {
    options.RegisterWorkflow<BasicWorkflow>();
    options.RegisterActivity<Activity1>();
    options.RegisterActivity<Activity2>();
});
var app = builder.Build();

app.MapPost("/start/{input}", async (string input) => {
    await using var scope  = app.Services.CreateAsyncScope();
    var workflowClient = scope.ServiceProvider.GetRequiredService<DaprWorkflowClient>();

    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(BasicWorkflow),
        input: input);

    return Results.Accepted(instanceId);
});

app.Run();
