package io.dapr.quickstarts.workflows.activities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import io.dapr.quickstarts.workflows.models.InventoryItem;
import io.dapr.quickstarts.workflows.models.InventoryRequest;
import io.dapr.quickstarts.workflows.models.InventoryResult;
import io.dapr.quickstarts.workflows.models.OrderPayload;
import io.dapr.workflows.runtime.WorkflowActivity;
import io.dapr.workflows.runtime.WorkflowActivityContext;

public class UpdateInventoryActivity implements WorkflowActivity {
  private static Logger logger = LoggerFactory.getLogger(UpdateInventoryActivity.class);

  private static final String STATE_STORE_NAME = "statestore";

  private DaprClient daprClient;

  public UpdateInventoryActivity() {
    this.daprClient = new DaprClientBuilder().build();
  }

  @Override
  public Object run(WorkflowActivityContext ctx) {
    InventoryRequest inventoryRequest = ctx.getInput(InventoryRequest.class);
    logger.info("Updating inventory for order '{}' of {} {}",
        inventoryRequest.getRequestId(), inventoryRequest.getQuantity(), inventoryRequest.getItemName());

    // Simulate slow processing
    try {
      Thread.sleep(2 * 1000);
    } catch (InterruptedException e) {
    }

    // Determine if there are enough Items for purchase
    State<InventoryItem> inventoryState = daprClient
        .getState(STATE_STORE_NAME, inventoryRequest.getItemName(), InventoryItem.class).block();
    InventoryItem inventory = inventoryState.getValue();
    int newQuantity = inventory.getQuantity() - inventoryRequest.getQuantity();
    if (newQuantity < 0) {
      logger.info("Not enough inventory for order '{}' of {} {}, there are only {} {}",
          inventoryRequest.getRequestId(), inventoryRequest.getQuantity(), inventoryRequest.getItemName(),
          inventory.getQuantity(), inventory.getName());

      InventoryResult inventoryResult = new InventoryResult();
      inventoryResult.setSuccess(false);
      return inventoryResult;
    }

    // Update the statestore with the new amount of paper clips
    OrderPayload updatedOrderPayload = new OrderPayload();
    updatedOrderPayload.setItemName(inventoryRequest.getItemName());
    updatedOrderPayload.setQuantity(newQuantity);
    daprClient.saveState(STATE_STORE_NAME, inventoryRequest.getItemName(), inventoryState.getEtag(),
        updatedOrderPayload, null).block();

    logger.info("Updated inventory for order '{}': there are now {} {} left in stock",
        inventoryRequest.getRequestId(), newQuantity, inventoryRequest.getItemName());
    // in addition to print to std out for validation
    System.out.println("there are now " + newQuantity + " " + inventoryRequest.getItemName() + " left in stock");
    InventoryResult inventoryResult = new InventoryResult();
    inventoryResult.setSuccess(true);
    return inventoryResult;
  }

}
