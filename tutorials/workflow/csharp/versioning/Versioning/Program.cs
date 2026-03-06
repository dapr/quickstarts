using Dapr.Workflow;
using Dapr.Workflow.Versioning;
using Versioning;

var builder = WebApplication.CreateBuilder(args);

// This is all that's needed to opt into automatic workflow versioning using a numerical suffix-based versioning strategy
// Do make sure to explicitly rebuild your application before running it so the source generator can identify any new workflows
builder.Services.AddDaprWorkflowVersioning();
builder.Services.AddDaprWorkflow(opt =>
{
	// Because we're using named versioning, there's no need to register our workflows expictly anymore
	
	opt.RegisterActivity<SendEmailActivity>();
	opt.RegisterActivity<SendSmsActivity>();
});

var app = builder.Build();

app.MapGet("/start", async (DaprWorkflowClient daprWorkflowClient) =>
{
	// Since we're using named versioning, specify the "canonical" or "family" name of the workflow to invoke, not
	// a specific version of it. This is ok to do for the first workflow wherein the name doesn't contain a version
	// suffix when the strategy options permit it (as the numerical versioning strategy does by default).
	var instanceId = await daprWorkflowClient.ScheduleNewWorkflowAsync(nameof(NotifyUserWorkflow), input: "user_id");
	return instanceId;
});

app.Run();
