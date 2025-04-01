using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapr.Workflow;
using FanOutFanIn.Activities;

namespace FanOutFanIn;

internal sealed class FanOutFanInWorkflow : Workflow<string[], string>
{
    public override async Task<string> RunAsync(WorkflowContext context, string[] input)
    {
        // This list will contain the tasks that will be executed by the Dapr Workflow engine.
        List<Task<WordLength>> tasks = new();

        foreach (string item in input)
        {
            // Tasks are added to the list
            tasks.Add(context.CallActivityAsync<WordLength>(
                nameof(GetWordLength),
                item));
        }

        // The Dapr Workflow engine will schedule all the tasks and wait for all tasks to complete before continuing.
        var allWordLengths = await Task.WhenAll(tasks);
        var shortestWord = allWordLengths.OrderBy(wl => wl.Length).First();

        return shortestWord.Word;
    }
}
