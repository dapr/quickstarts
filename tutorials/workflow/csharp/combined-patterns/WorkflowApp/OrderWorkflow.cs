using Dapr.Workflow;
using WorkflowApp.Activities;

namespace WorkflowApp;

internal sealed class OrderWorkflow : Workflow<Order, OrderStatus>
{
   public override async Task<OrderStatus> RunAsync(WorkflowContext context, Order order)
   {
       var inventoryTask = context.CallActivityAsync<ActivityResult>(
               nameof(CheckInventory),
               order.OrderItem);
        var shippingDestinationTask = context.CallActivityAsync<ActivityResult>(
               nameof(CheckShippingDestination),
               order);
       List<Task<ActivityResult>> tasks = [inventoryTask, shippingDestinationTask];
       var taskResult = await Task.WhenAll(tasks);

       if (taskResult.Any(r => !r.IsSuccess))
       {
           var message = $"Order processing failed. Reason: {taskResult.First(r => !r.IsSuccess).Message}";
           return new OrderStatus(IsSuccess: false, message);
       }

       var paymentResult = await context.CallActivityAsync<PaymentResult>(
           nameof(ProcessPayment),
           order);
       if (paymentResult.IsSuccess)
       {
           var inventoryResult = await context.CallActivityAsync<UpdateInventoryResult>(
               nameof(UpdateInventory),
               order.OrderItem);
       }

       ShipmentRegistrationStatus shipmentRegistrationStatus;
       try
       {
           await context.CallActivityAsync<RegisterShipmentResult>(
               nameof(RegisterShipment),
               order);
           shipmentRegistrationStatus = await context.WaitForExternalEventAsync<ShipmentRegistrationStatus>(
               eventName: Constants.SHIPMENT_REGISTERED_EVENT,
               timeout: TimeSpan.FromSeconds(300));
       }
       catch (TaskCanceledException)
       {
           // Timeout occurred
           var message = $"ShipmentRegistrationStatus for {order.Id} timed out.";
           return new OrderStatus(IsSuccess: false, message);
       }

       if (!shipmentRegistrationStatus.IsSuccess)
       {
           await context.CallActivityAsync(
               nameof(ReimburseCustomer),
               order);
           var message = $"ShipmentRegistrationStatus for {order.Id} failed. Customer is reimbursed.";
           return new OrderStatus(IsSuccess: false, message);
       }

       return new OrderStatus(IsSuccess: true, "Order {order.Id} processed successfully.");
   }
}

internal sealed record OrderStatus(bool IsSuccess, string Message);