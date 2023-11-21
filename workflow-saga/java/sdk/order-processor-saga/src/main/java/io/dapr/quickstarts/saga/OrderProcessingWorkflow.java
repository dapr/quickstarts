package io.dapr.quickstarts.saga;

import org.slf4j.Logger;

import io.dapr.quickstarts.saga.activities.DeliveryActivity;
import io.dapr.quickstarts.saga.activities.NotifyActivity;
import io.dapr.quickstarts.saga.activities.ProcessPaymentActivity;
import io.dapr.quickstarts.saga.activities.ProcessPaymentCompensationActivity;
import io.dapr.quickstarts.saga.activities.RequestApprovalActivity;
import io.dapr.quickstarts.saga.activities.ReserveInventoryActivity;
import io.dapr.quickstarts.saga.activities.UpdateInventoryActivity;
import io.dapr.quickstarts.saga.activities.UpdateInventoryCompensationActivity;
import io.dapr.quickstarts.saga.models.ApprovalResult;
import io.dapr.quickstarts.saga.models.InventoryRequest;
import io.dapr.quickstarts.saga.models.InventoryResult;
import io.dapr.quickstarts.saga.models.Notification;
import io.dapr.quickstarts.saga.models.OrderPayload;
import io.dapr.quickstarts.saga.models.OrderResult;
import io.dapr.quickstarts.saga.models.PaymentRequest;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import io.dapr.workflows.saga.SagaOption;

public class OrderProcessingWorkflow extends Workflow {

  @Override
  public WorkflowStub create() {
    return ctx -> {
      Logger logger = ctx.getLogger();
      String orderId = ctx.getInstanceId();
      logger.info("Starting Workflow: " + ctx.getName());
      logger.info("Instance ID(order ID): " + orderId);
      logger.info("Current Orchestration Time: " + ctx.getCurrentInstant());

      OrderPayload order = ctx.getInput(OrderPayload.class);
      logger.info("Received Order: " + order.toString());
      OrderResult orderResult = new OrderResult();

      // step1: notify the user that an order has come through
      Notification notification = new Notification();
      notification.setMessage("Received Order: " + order.toString());
      ctx.callActivity(NotifyActivity.class.getName(), notification).await();

      // step2: determine if there is enough of the item available for purchase by
      // checking the inventory
      InventoryRequest inventoryRequest = new InventoryRequest();
      inventoryRequest.setRequestId(orderId);
      inventoryRequest.setItemName(order.getItemName());
      inventoryRequest.setQuantity(order.getQuantity());
      InventoryResult inventoryResult = ctx.callActivity(ReserveInventoryActivity.class.getName(),
          inventoryRequest, InventoryResult.class).await();

      // If there is insufficient inventory, fail and let the user know
      if (!inventoryResult.isSuccess()) {
        notification.setMessage("Insufficient inventory for order : " + order.getItemName());
        ctx.callActivity(NotifyActivity.class.getName(), notification).await();
        ctx.complete(orderResult);
        return;
      }

      // step3: require orders over a certain threshold to be approved
      if (order.getTotalCost() > 5000) {
        ApprovalResult approvalResult = ctx.callActivity(RequestApprovalActivity.class.getName(),
            order, ApprovalResult.class).await();
        if (approvalResult != ApprovalResult.Approved) {
          notification.setMessage("Order " + order.getItemName() + " was not approved.");
          ctx.callActivity(NotifyActivity.class.getName(), notification).await();
          ctx.complete(orderResult);
          return;
        }
      }

      // There is enough inventory available so the user can purchase the item(s).
      // step4: Process their payment (need compensation)
      PaymentRequest paymentRequest = new PaymentRequest();
      paymentRequest.setRequestId(orderId);
      paymentRequest.setItemBeingPurchased(order.getItemName());
      paymentRequest.setQuantity(order.getQuantity());
      paymentRequest.setAmount(order.getTotalCost());
      boolean isOK = ctx.callActivity(ProcessPaymentActivity.class.getName(),
          paymentRequest, boolean.class).await();
      if (!isOK) {
        notification.setMessage("Payment failed for order : " + orderId);
        ctx.callActivity(NotifyActivity.class.getName(), notification).await();
        ctx.complete(orderResult);
        return;
      }
      ctx.registerCompensation(ProcessPaymentCompensationActivity.class.getName(), paymentRequest);

      // step5: Update the inventory (need compensation)
      inventoryResult = ctx.callActivity(UpdateInventoryActivity.class.getName(),
          inventoryRequest, InventoryResult.class).await();
      if (!inventoryResult.isSuccess()) {
        // Let users know their payment processing failed
        notification.setMessage("Order failed to update inventory! : " + orderId);
        ctx.callActivity(NotifyActivity.class.getName(), notification).await();

        // trigger saga compensation gracefully
        ctx.compensate();
        orderResult.setCompensated(true);
        ctx.complete(orderResult);
        return;
      }
      ctx.registerCompensation(UpdateInventoryCompensationActivity.class.getName(), inventoryRequest);

      // step6: delevery (allways be failed to trigger compensation)
      ctx.callActivity(DeliveryActivity.class.getName()).await();

      // step7: Let user know their order was processed(won't be executed if step6
      // failed)
      notification.setMessage("Order completed! : " + orderId);
      ctx.callActivity(NotifyActivity.class.getName(), notification).await();

      // Complete the workflow with order result is processed(won't be executed if
      // step6 failed)
      orderResult.setProcessed(true);
      ctx.complete(orderResult);
    };
  }

  @Override
  public SagaOption getSagaOption() {
    return SagaOption.newBuilder().setParallelCompensation(false)
        .setContinueWithError(true).build();
  }

}
