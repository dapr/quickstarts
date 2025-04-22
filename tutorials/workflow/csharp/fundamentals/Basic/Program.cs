using Basic;
using Basic.Activities;
using Dapr.Workflow;

var builder = WebApplication.CreateBuilder(args);
// Dapr Workflows and Activities need to be registered in the DI container otherwise
// the Dapr runtime does not know this application contains workflows and activities.
builder.Services.AddDaprWorkflow(options =>
{
    options.RegisterWorkflow<BasicWorkflow>();
    options.RegisterActivity<Activity1>();
    options.RegisterActivity<Activity2>();
});
var app = builder.Build();

app.MapPost("/start/{input}", async (
    string input,
    DaprWorkflowClient workflowClient) =>
{
    /// The DaprWorkflowClient is the API to manage workflows.
    /// Here it is used to schedule a new workflow instance.
    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(BasicWorkflow),
        input: input);

    return Results.Accepted(instanceId);
});

app.Run();
