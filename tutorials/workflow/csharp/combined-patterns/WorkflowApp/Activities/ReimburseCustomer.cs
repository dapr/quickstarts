using Dapr.Workflow;

namespace WorkflowApp.Activities;

internal sealed class ReimburseCustomer : WorkflowActivity<Order, ReimburseCustomerResult>
{
    public override Task<ReimburseCustomerResult> RunAsync(WorkflowActivityContext context, Order order)
    {
        Console.WriteLine($"{nameof(ReimburseCustomer)}: Received input: {order}.");
        return Task.FromResult(new ReimburseCustomerResult(IsSuccess: true));
    }
}

internal sealed record ReimburseCustomerResult(bool IsSuccess);