using Dapr.Workflow;

namespace WorkflowApp.Activities;

public class ReimburseCustomer : WorkflowActivity<Order, ReimburseCustomerResult>
{
    public override Task<ReimburseCustomerResult> RunAsync(WorkflowActivityContext context, Order order)
    {
        Console.WriteLine($"{nameof(ReimburseCustomer)}: Received input: {order}.");
        return Task.FromResult(new ReimburseCustomerResult(IsSuccess: true));
    }
}

public record ReimburseCustomerResult(bool IsSuccess);