package io.dapr.springboot.workflowapp;

import io.dapr.client.DaprClient;
import io.dapr.springboot.workflowapp.model.ProductInventory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class InventoryManagementService {

  @Autowired
  private DaprClient daprClient;

  public void createDefaultInventory(){
    ProductInventory productInventory = new ProductInventory("RBD001", 50);
    daprClient.saveState("inventory", productInventory.productId(), productInventory).block();
  }

}
