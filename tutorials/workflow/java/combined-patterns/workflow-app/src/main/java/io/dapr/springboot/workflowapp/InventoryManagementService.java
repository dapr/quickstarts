package io.dapr.springboot.workflowapp;

import io.dapr.client.DaprClient;
import io.dapr.springboot.workflowapp.model.ProductInventory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import static io.dapr.springboot.workflowapp.WorkflowAppRestController.DAPR_INVENTORY_COMPONENT;

@Component
public class InventoryManagementService {

  @Autowired
  private DaprClient daprClient;

  public void createDefaultInventory(){
    ProductInventoryItem productInventory = new ProductInventoryItem("RBD001", "Rubber Duck",50);
    daprClient.saveState(DAPR_INVENTORY_COMPONENT, productInventory.productId(), productInventory).block();
  }

  record ProductInventoryItem(String productId, String productName, int quantity){}

}
