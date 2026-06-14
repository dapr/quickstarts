using Dapr.Workflow;
using FanOutFanIn.Activities;

namespace FanOutFanIn;

internal sealed class FanOutFanInWorkflow : Workflow<string[], string>
{
    public override async Task<string> RunAsync(WorkflowContext context, string[] input)
    {
        ArgumentOutOfRangeException.ThrowIfEqual(input.Length, 0, nameof(input));
        
        // This list will contain the tasks that will be executed by the Dapr Workflow engine.
        List<Task<WordLength>> tasks = [];
        tasks.AddRange(input.Select(item => context.CallActivityAsync<WordLength>(nameof(GetWordLength), item)));

        // The Dapr Workflow engine will schedule all the tasks and wait for all tasks to complete before continuing.
        var allWordLengths = await Task.WhenAll(tasks);
        var shortestWord = allWordLengths.OrderBy(wl => wl.Length).First();

        return shortestWord.Word;
    }
}
