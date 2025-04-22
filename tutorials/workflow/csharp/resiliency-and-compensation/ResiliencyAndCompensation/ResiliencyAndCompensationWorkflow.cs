using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapr.Workflow;
using ResiliencyAndCompensation.Activities;

namespace ResiliencyAndCompensation;

internal sealed class ResiliencyAndCompensationWorkflow : Workflow<int, int?>
{
    public override async Task<int?> RunAsync(WorkflowContext context, int input)
    {
         // This creates a retry policy that retries activities up to 3 times with an initial delay of 2 seconds.
         var defaultActivityRetryOptions = new WorkflowTaskOptions
         {
            RetryPolicy = new WorkflowRetryPolicy(
                maxNumberOfAttempts: 3,
                firstRetryInterval: TimeSpan.FromSeconds(2)),
         };
        
        var result1 = await context.CallActivityAsync<int>(
            nameof(MinusOne),
            input,
            defaultActivityRetryOptions);

        int? workflowResult = null;
        try
        {
            workflowResult = await context.CallActivityAsync<int>(
                nameof(Division),
                result1,
                defaultActivityRetryOptions);
        }
        catch (WorkflowTaskFailedException ex)
        {
            // Something went wrong in the Division activity which is not recoverable.
            // Perform a compensation action for the MinusOne activity to revert any
            // changes made in that activity.
            if (ex.FailureDetails.IsCausedBy<OverflowException>())
            {
                workflowResult = await context.CallActivityAsync<int>(
                    nameof(PlusOne),
                    result1,
                    defaultActivityRetryOptions);

                // A custom status message can be set on the workflow instance.
                // This can be used to clarify anything that happened during the workflow execution.
                context.SetCustomStatus("Compensated MinusOne activity with PlusOne activity.");
            }
        }

        return workflowResult;
    }
}