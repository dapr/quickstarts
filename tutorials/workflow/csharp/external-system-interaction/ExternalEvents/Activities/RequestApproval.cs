using Dapr.Workflow;
using ExternalEvents;

namespace ExternalEvents.Activities;

internal sealed class RequestApproval : WorkflowActivity<Order, bool>
{
    public override Task<bool> RunAsync(WorkflowActivityContext context, Order order)
    {
        Console.WriteLine($"{nameof(RequestApproval)}: Received order: {order.Id}.");
        // Imagine an approval request being sent to another system
        return Task.FromResult(true);
    }
}
