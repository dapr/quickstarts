using Dapr.Workflow;

namespace WorkflowApp.Activities;

public class ProcessPayment : WorkflowActivity<Order, PaymentResult>
{
    public override Task<PaymentResult> RunAsync(WorkflowActivityContext context, Order order)
    {
        Console.WriteLine($"{nameof(ProcessPayment)}: Received input: {order}.");
        return Task.FromResult(new PaymentResult(IsSuccess: true));
    }
}

public record PaymentResult(bool IsSuccess);