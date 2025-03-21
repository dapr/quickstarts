using Dapr.Workflow;

namespace FanOutFanIn.Activities;

public class GetWordLength : WorkflowActivity<string, WordLength>
{
    public override Task<WordLength> RunAsync(WorkflowActivityContext context, string input)
    {
        Console.WriteLine($"{nameof(GetWordLength)}: Received input: {input}.");
        return Task.FromResult(new WordLength(input, input.Length));
    }
}

public record WordLength(string Word, int Length);
