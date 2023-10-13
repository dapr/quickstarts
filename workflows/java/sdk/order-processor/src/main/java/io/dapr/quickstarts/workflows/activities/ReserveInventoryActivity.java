package io.dapr.quickstarts.workflows.activities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import io.dapr.quickstarts.workflows.models.InventoryItem;
import io.dapr.quickstarts.workflows.models.InventoryRequest;
import io.dapr.quickstarts.workflows.models.InventoryResult;
import io.dapr.workflows.runtime.WorkflowActivity;
import io.dapr.workflows.runtime.WorkflowActivityContext;

public class ReserveInventoryActivity implements WorkflowActivity {
  private static Logger logger = LoggerFactory.getLogger(ReserveInventoryActivity.class);

  private static final String STATE_STORE_NAME = "statestore";

  private DaprClient daprClient;

  public ReserveInventoryActivity() {
    this.daprClient = new DaprClientBuilder().build();
  }

  @Override
  public Object run(WorkflowActivityContext ctx) {
    InventoryRequest inventoryRequest = ctx.getInput(InventoryRequest.class);
    logger.info("Reserving inventory for order '{}' of {} {}",
        inventoryRequest.getRequestId(), inventoryRequest.getQuantity(), inventoryRequest.getItemName());

    State<InventoryItem> inventoryState = daprClient.getState(STATE_STORE_NAME, inventoryRequest.getItemName(), InventoryItem.class).block();
    InventoryItem inventory = inventoryState.getValue();

    logger.info("There are {} {} available for purchase",
        inventory.getQuantity(), inventory.getName());

    // See if there're enough items to purchase
    if (inventory.getQuantity() >= inventoryRequest.getQuantity()) {
      // Simulate slow processing
      try {
        Thread.sleep(2 * 1000);
      } catch (InterruptedException e) {
      }
      logger.info("Reserved inventory for order '{}' of {} {}",
          inventoryRequest.getRequestId(), inventoryRequest.getQuantity(), inventoryRequest.getItemName());
      InventoryResult inventoryResult = new InventoryResult();
      inventoryResult.setSuccess(true);
      inventoryResult.setInventoryItem(inventory);
      return inventoryResult;
    }

    // Not enough items.
    logger.info("Not enough items to reserve inventory for order '{}' of {} {}",
        inventoryRequest.getRequestId(), inventoryRequest.getQuantity(), inventoryRequest.getItemName());
    InventoryResult inventoryResult = new InventoryResult();
    inventoryResult.setSuccess(false);
    inventoryResult.setInventoryItem(inventory);
    return inventoryResult;
  }

}
