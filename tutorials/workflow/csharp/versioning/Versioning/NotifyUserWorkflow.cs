using Dapr.Workflow;

namespace Versioning;

/// <summary>
/// Identifies a workflow in which a patch has been applied. When the workflow runs from the top, it will opt into
/// all `IsPatched` branches by default and only take the false path if the workflow is in flight and the patch wasn't
/// observed in the event history to date.
/// </summary>
public sealed partial class NotifyUserWorkflow : Workflow<string, string>
{
	public override async Task<string> RunAsync(WorkflowContext context, string input)
	{
		var logger = context.CreateReplaySafeLogger<NotifyUserWorkflow>();
		LogRunningWorkflow(logger);
		
		// Step 1: Remove the comments in the class below to add a patch to the class directly and run a different
		// activity when the workflow runs.
		// if (context.IsPatched("send_sms"))
		// {
		// 	LogTakingPatchedPath(logger, nameof(SendSmsActivity));
		// 	return await context.CallActivityAsync<string>(nameof(SendSmsActivity), input);
		// }
		// else
		// {
			LogTakingUnpatchedPath(logger, nameof(SendEmailActivity));
			return await context.CallActivityAsync<string>(nameof(SendEmailActivity), input);
		//}
	}

	[LoggerMessage(LogLevel.Information, "Running the original version of the NotifyUserWorkflow workflow family")]
	private static partial void LogRunningWorkflow(ILogger logger);

	[LoggerMessage(LogLevel.Information, "Taking the patched path and calling '{ActivityName}'")]
	private static partial void LogTakingPatchedPath(ILogger logger, string activityName);

	[LoggerMessage(LogLevel.Information, "Taking the unpatched path and calling '{ActivityName}'")]
	private static partial void LogTakingUnpatchedPath(ILogger logger, string activityName);
}