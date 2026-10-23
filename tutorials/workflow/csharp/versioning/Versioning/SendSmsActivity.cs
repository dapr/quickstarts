using Dapr.Workflow;

namespace Versioning;

public sealed partial class SendSmsActivity(ILogger<SendSmsActivity> logger) : WorkflowActivity<string, string>
{
	public override Task<string> RunAsync(WorkflowActivityContext context, string input)
	{
		LogSendSms(input);
		return Task.FromResult($"Sent SMS to '{input}'");
	}

	[LoggerMessage(LogLevel.Information, "Received input: '{input}'")]
	private partial void LogSendSms(string input);
}