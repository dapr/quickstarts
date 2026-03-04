using Dapr.Workflow;
using Dapr.Workflow.Versioning;

namespace Versioning;

// Step 2: Uncomment out the following class and rebuild. The presence of the installed `Dapr.Workflow.Versioning` package
// will run a source generator that discovers this new class and, per the default versioning strategy of using a numeric
// suffix (itself with an optional prefix), will automatically correlate this version with the `NotifyUserWorkflow` we
// started with (recognized as implicitly being version 0). At runtime then, this workflow will be run despite scheduling
// against the `NotifyUserWorkflow` name because that will instead be used as the canonical family name identifying this
// set of common workflows. Further, the default selector will favor the highest version number registererd, which
// means this workflow will be run instead for new invocations.

// /// <summary>
// /// Identifies a workflow "after" being versioned by name. Note that presence of "V2" in the name identifying this
// /// as a later version of the workflow family "NotifyUserWorkflow" - this is
// /// because the Dapr .NET Workflow Versioning SDK uses a numerical version strategy by default, but this can
// /// be trivially overridden with another built-in strategy or replaced with your own strategy implementing
// /// <see cref="IWorkflowVersionStrategy"/>.
// ///
// /// Here, we can refactor to simply remove the patch altogether and exclusively use `SendSmsActivity`.
// /// </summary>
// public sealed partial class NotifyUserWorkflowV2 : Workflow<string, string>
// {
// 	// Rather than call `SendEmailActivity`, we instead call `SendSmsActivity` in this version of the workflow.
// 	public override async Task<string> RunAsync(WorkflowContext context, string input)
// 	{
// 		var logger = context.CreateReplaySafeLogger<NotifyUserWorkflowV2>();
// 		LogRunningWorkflow(logger);
// 		
// 		return await context.CallActivityAsync<string>(nameof(SendSmsActivity), input);
// 	}
//
// 	[LoggerMessage(LogLevel.Information, "Running v2 of the NotifyUserWorkflow workflow family")]
// 	private static partial void LogRunningWorkflow(ILogger logger);
// }