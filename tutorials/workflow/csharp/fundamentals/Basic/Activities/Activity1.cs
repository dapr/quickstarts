using Dapr.Workflow;

namespace Basic.Activities;

/// <summary>
/// Activities inherit from the abstract WorkflowActivity class from the Dapr.Workflow namespace.
/// The first generic parameter is the input type of the activity, and the second parameter is the output type.
/// Activity code typically performs a one specific task, like calling an API to store retrieve data.
/// You can use other Dapr APIs inside an activity.
/// </summary>
internal sealed class Activity1 : WorkflowActivity<string, string>
{
    /// <summary>
    /// The RunAsync method is an abstract method in the abstract WorkflowActivity class that needs to be implemented.
    /// This method is the entry point for the activity.
    /// </summary>
    /// <param name="context">The WorkflowActivityContext provides the name of the activity and the workflow instance.</param>
    /// <param name="input">The input parameter for the activity. There can only be one input parameter. Use a record or class if multiple input values are required.</param>
    /// <returns>The return value of the activity. It can be a simple or complex type. In case an activity doesn't require an output, you can specify a nullable object since a return type is mandatory.</returns>
    public override Task<string> RunAsync(WorkflowActivityContext context, string input)
    {
        Console.WriteLine($"{nameof(Activity1)}: Received input: {input}.");
        return Task.FromResult($"{input} Two" );
    }
}
