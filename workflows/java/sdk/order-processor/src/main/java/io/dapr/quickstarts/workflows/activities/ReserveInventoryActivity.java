package io.dapr.quickstarts.workflows.activities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.quickstarts.workflows.models.InventoryItem;
import io.dapr.quickstarts.workflows.models.InventoryRequest;
import io.dapr.quickstarts.workflows.models.InventoryResult;
import io.dapr.workflows.runtime.WorkflowActivity;
import io.dapr.workflows.runtime.WorkflowActivityContext;

public class ReserveInventoryActivity implements WorkflowActivity {
  private static Logger logger = LoggerFactory.getLogger(ReserveInventoryActivity.class);

  @Override
  public Object run(WorkflowActivityContext ctx) {
    InventoryRequest inventoryRequest = ctx.getInput(InventoryRequest.class);
    logger.info("Reserving inventory for order '{}' of {} {}",
        inventoryRequest.getRequestId(), inventoryRequest.getQuantity(), inventoryRequest.getItemName());

    // hard code that we have some inventory in this example
    // TBD: use DaprClient to query state store for inventory
    InventoryItem item = new InventoryItem();
    item.setName(inventoryRequest.getItemName());
    item.setQuantity(1000);
    item.setPerItemCost(10);
    logger.info("There are {} {} available for purchase",
        item.getQuantity(), item.getName());

    // See if there're enough items to purchase
    if (item.getQuantity() >= inventoryRequest.getQuantity()) {
      // Simulate slow processing
      try {
        Thread.sleep(2 * 1000);
      } catch (InterruptedException e) {
      }
      logger.info("Reserved inventory for order '{}' of {} {}",
          inventoryRequest.getRequestId(), inventoryRequest.getQuantity(), inventoryRequest.getItemName());
      InventoryResult inventoryResult = new InventoryResult();
      inventoryResult.setSuccess(true);
      inventoryResult.setInventoryItem(item);
      return inventoryResult;
    }

    // Not enough items.
    logger.info("Not enough items to reserve inventory for order '{}' of {} {}",
        inventoryRequest.getRequestId(), inventoryRequest.getQuantity(), inventoryRequest.getItemName());
    InventoryResult inventoryResult = new InventoryResult();
    inventoryResult.setSuccess(false);
    inventoryResult.setInventoryItem(item);
    return inventoryResult;
  }

}
