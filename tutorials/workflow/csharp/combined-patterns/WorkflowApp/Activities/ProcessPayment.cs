using Dapr.Workflow;

namespace WorkflowApp.Activities;

internal sealed class ProcessPayment : WorkflowActivity<Order, PaymentResult>
{
    public override Task<PaymentResult> RunAsync(WorkflowActivityContext context, Order order)
    {
        Console.WriteLine($"{nameof(ProcessPayment)}: Received input: {order}.");
        return Task.FromResult(new PaymentResult(IsSuccess: true));
    }
}

internal sealed record PaymentResult(bool IsSuccess);