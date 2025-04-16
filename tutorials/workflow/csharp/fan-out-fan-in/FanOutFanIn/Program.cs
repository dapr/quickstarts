using Dapr.Workflow;
using FanOutFanIn;
using FanOutFanIn.Activities;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow(options =>
{
    options.RegisterWorkflow<FanOutFanInWorkflow>();
    options.RegisterActivity<GetWordLength>();
});
var app = builder.Build();

app.MapPost("/start", async (
    string[] words,
    DaprWorkflowClient workflowClient) =>
{
    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(FanOutFanInWorkflow),
        input: words);

    return Results.Accepted(instanceId);
});

app.Run();
