using Dapr.Workflow;
using ResiliencyAndCompensation;
using ResiliencyAndCompensation.Activities;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDaprWorkflow(options =>
{
    options.RegisterWorkflow<ResiliencyAndCompensationWorkflow>();
    options.RegisterActivity<MinusOne>();
    options.RegisterActivity<Division>();
    options.RegisterActivity<PlusOne>();
});
var app = builder.Build();

app.MapPost("/start/{input}", async (
    int input,
    DaprWorkflowClient workflowClient) =>
{
    var instanceId = await workflowClient.ScheduleNewWorkflowAsync(
        name: nameof(ResiliencyAndCompensationWorkflow),
        input: input);

    return Results.Accepted(instanceId);
});

app.Run();
