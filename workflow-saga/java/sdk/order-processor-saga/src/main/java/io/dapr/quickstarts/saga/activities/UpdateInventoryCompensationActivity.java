package io.dapr.quickstarts.saga.activities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import io.dapr.quickstarts.saga.models.InventoryItem;
import io.dapr.quickstarts.saga.models.InventoryRequest;
import io.dapr.quickstarts.saga.models.OrderPayload;
import io.dapr.workflows.runtime.WorkflowActivity;
import io.dapr.workflows.runtime.WorkflowActivityContext;

public class UpdateInventoryCompensationActivity implements WorkflowActivity {
  private static Logger logger = LoggerFactory.getLogger(UpdateInventoryCompensationActivity.class);

  private static final String STATE_STORE_NAME = "statestore";

  @Override
  public Object run(WorkflowActivityContext ctx) {
    InventoryRequest inventoryRequest = ctx.getInput(InventoryRequest.class);

    logger.info("Compensating inventory for order '{}' of {} {}",
        inventoryRequest.getRequestId(), inventoryRequest.getQuantity(), inventoryRequest.getItemName());

    logger.info("Compensating inventory for order '{}' of {} {}",
        inventoryRequest.getRequestId(), inventoryRequest.getQuantity(), inventoryRequest.getItemName());

    try {
      DaprClient daprClient = new DaprClientBuilder().build();
      State<InventoryItem> inventoryState = daprClient
          .getState(STATE_STORE_NAME, inventoryRequest.getItemName(), InventoryItem.class).block();
      InventoryItem inventory = inventoryState.getValue();
      int newQuantity = inventory.getQuantity() + inventoryRequest.getQuantity();

      // Update the statestore with the new amount
      OrderPayload updatedOrderPayload = new OrderPayload();
      updatedOrderPayload.setItemName(inventoryRequest.getItemName());
      updatedOrderPayload.setQuantity(newQuantity);
      daprClient.saveState(STATE_STORE_NAME, inventoryRequest.getItemName(), inventoryState.getEtag(),
          updatedOrderPayload, null).block();

      logger.info("Compensated inventory for order '{}': there are now {} {} left in stock",
          inventoryRequest.getRequestId(), newQuantity, inventoryRequest.getItemName());
      // in addition to print to std out for validation
      System.out.println("there are now " + newQuantity + " " + inventoryRequest.getItemName() + " left in stock");
      return null;
    } catch (Exception e) {
      throw e;
    }
  }

}
