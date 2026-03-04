using Dapr.Workflow;

namespace Versioning;

public sealed partial class SendEmailActivity(ILogger<SendEmailActivity> logger) : WorkflowActivity<string, string>
{
	public override Task<string> RunAsync(WorkflowActivityContext context, string input)
	{
		LogReceivedInput(input);
		return Task.FromResult($"Sent email to {input}");
	}

	[LoggerMessage(LogLevel.Information, "Received input: '{input}'")]
	private partial void LogReceivedInput(string input);
}