package io.dapr.quickstarts.workflows.activities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.quickstarts.workflows.models.InventoryRequest;
import io.dapr.quickstarts.workflows.models.InventoryResult;
import io.dapr.workflows.runtime.WorkflowActivity;
import io.dapr.workflows.runtime.WorkflowActivityContext;

public class UpdateInventoryActivity implements WorkflowActivity {
  private static Logger logger = LoggerFactory.getLogger(UpdateInventoryActivity.class);

  @Override
  public Object run(WorkflowActivityContext ctx) {
    InventoryRequest inventoryRequest = ctx.getInput(InventoryRequest.class);
    logger.info("Updating inventory for order '{}' of {} {}",
        inventoryRequest.getRequestId(), inventoryRequest.getQuantity(), inventoryRequest.getItemName());

    // hard code that we updated inventory in this example
    // TBD: use DaprClient to update state store for inventory
    // Simulate slow processing
    try {
      Thread.sleep(2 * 1000);
    } catch (InterruptedException e) {
    }
    logger.info("Updated inventory for order '{}' of {} {}",
        inventoryRequest.getRequestId(), inventoryRequest.getQuantity(), inventoryRequest.getItemName());
    InventoryResult inventoryResult = new InventoryResult();
    inventoryResult.setSuccess(true);
    return inventoryResult;
  }

}
