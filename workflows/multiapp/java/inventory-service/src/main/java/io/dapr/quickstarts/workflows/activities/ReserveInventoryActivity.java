package io.dapr.quickstarts.workflows.activities;

import io.dapr.workflows.WorkflowActivity;
import io.dapr.workflows.WorkflowActivityContext;

/**
 * ReserveInventoryActivity for Inventory Service - reserves inventory items.
 * This activity is called multi-app from the main workflow.
 */
public class ReserveInventoryActivity implements WorkflowActivity {
    @Override
    public Object run(WorkflowActivityContext context) {
        var logger = context.getLogger();
        logger.info("=== Inventory Service: ReserveInventoryActivity STARTED ===");
        
        try {
            Object inputObj = context.getInput(Object.class);
            logger.info("Received order: {}", inputObj);

            // Create InventoryResult object
            InventoryResult result = new InventoryResult();
            result.success = true;
            result.reservedItems = new Item[0];
            result.message = "Inventory reserved successfully by inventory service";
            logger.info("=== Inventory Service: ReserveInventoryActivity COMPLETED SUCCESSFULLY ===");
            
            return result;
        } catch (Exception e) {
            logger.error("ERROR in ReserveInventoryActivity: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    // InventoryResult class (to match Go struct)
    public static class InventoryResult {
        public boolean success;
        public Item[] reservedItems;
        public String message;
        
        @Override
        public String toString() {
            return String.format("InventoryResult{success=%s, reservedItems=%d items, message='%s'}", 
                success, reservedItems != null ? reservedItems.length : 0, message);
        }
    }
    
    // Item class (to match Go struct)
    public static class Item {
        public String productId;
        public String name;
        public double price;
        public int quantity;
    }
}
