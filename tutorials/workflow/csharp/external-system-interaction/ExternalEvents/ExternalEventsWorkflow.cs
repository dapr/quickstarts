using Dapr.Workflow;
using ExternalEvents.Activities;

namespace ExternalEvents;

public class ExternalEventsWorkflow : Workflow<Order, string>
{
    public override async Task<string> RunAsync(WorkflowContext context, Order order)
    {
        ApprovalStatus approvalStatus = new(order.Id, true);
        string notificationMessage;
        
        if (order.TotalPrice > 250)
        {
            try
            {
                approvalStatus = await context.WaitForExternalEventAsync<ApprovalStatus>(
                    eventName: "approval-event",
                    timeout: TimeSpan.FromSeconds(120));
            }
            catch (TaskCanceledException)
            {
                // Timeout occurred
                notificationMessage = $"Approval request for order {order.Id} timed out.";
                await context.CallActivityAsync(
                    nameof(SendNotification),
                    notificationMessage);
                return notificationMessage;
            }
        }

        if (approvalStatus.IsApproved)
        {
            await context.CallActivityAsync(
                nameof(ProcessOrder),
                order);
        }

        notificationMessage = approvalStatus.IsApproved
            ? $"Order {order.Id} has been approved."
            : $"Order {order.Id} has been rejected.";
        await context.CallActivityAsync(
                nameof(SendNotification),
                notificationMessage);

        return notificationMessage;
    }
}

public record ApprovalStatus(string OrderId, bool IsApproved);
