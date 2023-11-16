package io.dapr.quickstarts.saga;

import org.slf4j.Logger;

import com.microsoft.durabletask.interruption.OrchestratorBlockedException;

import io.dapr.quickstarts.saga.activities.DeliveryActivity;
import io.dapr.quickstarts.saga.activities.NotifyActivity;
import io.dapr.quickstarts.saga.activities.ProcessPaymentActivity;
import io.dapr.quickstarts.saga.activities.RequestApprovalActivity;
import io.dapr.quickstarts.saga.activities.ReserveInventoryActivity;
import io.dapr.quickstarts.saga.activities.UpdateInventoryActivity;
import io.dapr.quickstarts.saga.models.ApprovalResult;
import io.dapr.quickstarts.saga.models.InventoryRequest;
import io.dapr.quickstarts.saga.models.InventoryResult;
import io.dapr.quickstarts.saga.models.Notification;
import io.dapr.quickstarts.saga.models.OrderPayload;
import io.dapr.quickstarts.saga.models.OrderResult;
import io.dapr.quickstarts.saga.models.PaymentRequest;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import io.dapr.workflows.saga.Saga;
import io.dapr.workflows.saga.SagaConfiguration;

public class OrderProcessingWorkflow extends Workflow {

  @Override
  public WorkflowStub create() {
    return ctx -> {
      Logger logger = ctx.getLogger();
      String orderId = ctx.getInstanceId();
      logger.info("Starting Workflow: " + ctx.getName());
      logger.info("Instance ID(order ID): " + orderId);
      logger.info("Current Orchestration Time: " + ctx.getCurrentInstant());

      SagaConfiguration config = SagaConfiguration.newBuilder()
          .setParallelCompensation(false)
          .setContinueWithError(true).build();
      Saga saga = new Saga(config);

      OrderPayload order = ctx.getInput(OrderPayload.class);
      logger.info("Received Order: " + order.toString());
      OrderResult orderResult = new OrderResult();

      try {

        // step1: notify the user that an order has come through
        Notification notification = new Notification();
        notification.setMessage("Received Order: " + order.toString());
        ctx.callActivity(NotifyActivity.class.getName(), notification).await();

        // step2: determine if there is enough of the item available for purchase by
        // checking
        // the inventory
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
        // payment activity is processed, register for compensation
        saga.registerCompensation(ProcessPaymentActivity.class.getName(), paymentRequest, isOK);

        // step5: Update the inventory (need compensation)
        inventoryResult = ctx.callActivity(UpdateInventoryActivity.class.getName(),
            inventoryRequest, InventoryResult.class).await();
        if (!inventoryResult.isSuccess()) {
          // Let users know their payment processing failed
          notification.setMessage("Order failed to update inventory! : " + orderId);
          ctx.callActivity(NotifyActivity.class.getName(), notification).await();

          // throw exception to trigger compensation
          throw new RuntimeException("Failed to update inventory");
        }
        // Update Inventory activity is succeed, register for compensation
        saga.registerCompensation(UpdateInventoryActivity.class.getName(), inventoryRequest, inventoryResult);

        // step6: delevery (allways be failed to trigger compensation)
        ctx.callActivity(DeliveryActivity.class.getName(), null).await();

        // step7: Let user know their order was processed(won't be executed if step6
        // failed)
        notification.setMessage("Order completed! : " + orderId);
        ctx.callActivity(NotifyActivity.class.getName(), notification).await();

        // Complete the workflow with order result is processed(won't be executed if
        // step6 failed)
        orderResult.setProcessed(true);
        ctx.complete(orderResult);
      } catch (OrchestratorBlockedException e) {
        //TODO: try to improve design and remove this exception catch
        throw e;
      } catch (Exception e) {
        orderResult.setCompensated(true);
        ctx.complete(orderResult);
        
        saga.compensate();
      }
    };
  }

}
