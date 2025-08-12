/*
 * Copyright 2025 The Dapr Authors
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
limitations under the License.
*/

package io.dapr.springboot.workflowapp;


import io.dapr.Topic;
import io.dapr.client.DaprClient;
import io.dapr.client.domain.CloudEvent;
import io.dapr.client.domain.State;
import io.dapr.spring.workflows.config.EnableDaprWorkflows;
import io.dapr.springboot.workflowapp.model.Order;
import io.dapr.springboot.workflowapp.model.OrderStatus;
import io.dapr.springboot.workflowapp.model.ProductInventory;
import io.dapr.springboot.workflowapp.model.ShipmentRegistrationStatus;
import io.dapr.springboot.workflowapp.workflow.OrderWorkflow;
import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeoutException;

@RestController
/*
 * Dapr Workflows and Activities need to be registered in the DI container otherwise
 *  the Dapr runtime does not know this application contains workflows and activities.
 *  In Spring Boot Applications, the `@EnableDaprWorkflow` annotation takes care of registering
 *  all workflows and activities components found in the classpath.
 */
@EnableDaprWorkflows
public class WorkflowAppRestController {

  private final Logger logger = LoggerFactory.getLogger(WorkflowAppRestController.class);

  public static final String DAPR_INVENTORY_COMPONENT = "inventory";
  public static final String DAPR_PUBSUB_COMPONENT = "shippingpubsub";
  public static final String DAPR_PUBSUB_REGISTRATION_TOPIC = "shipment-registration-events";
  public static final String SHIPMENT_REGISTERED_EVENT = "shipment-registered-event";

  @Autowired
  private DaprWorkflowClient daprWorkflowClient;

  @Autowired
  private DaprClient daprClient;

  private InventoryManagementService inventoryManagementService;

  public WorkflowAppRestController(InventoryManagementService inventoryManagementService) {
    this.inventoryManagementService = inventoryManagementService;
    inventoryManagementService.createDefaultInventory();
  }

  /**
   * The DaprWorkflowClient is the API to manage workflows.
   * Here it is used to schedule a new workflow instance.
   *
   * @return the instanceId of the OrderWorkflow execution
   */
  @PostMapping("start")
  public String basic(@RequestBody Order order) throws TimeoutException {
    logger.info("Received order: {}", order);
    return daprWorkflowClient.scheduleNewWorkflow(OrderWorkflow.class, order, order.id());
  }


  /**
   *  This endpoint handles messages that are published to the shipment-registration-confirmed-events topic.
   *  It uses the workflow management API to raise an event to the workflow instance to indicate that the
   *  shipment has been registered by the ShippingApp.
   * @param status ShipmentRegistrationStatus
   */
  @PostMapping("shipmentRegistered")
  @Topic(pubsubName = DAPR_PUBSUB_COMPONENT, name = "shipment-registration-confirmed-events")
  public void shipmentRegistered(@RequestBody CloudEvent<ShipmentRegistrationStatus> status){
    logger.info("Shipment registered for order {}", status.getData());
    daprWorkflowClient.raiseEvent(status.getData().orderId(), SHIPMENT_REGISTERED_EVENT, status.getData());
  }


  /**
   *  This endpoint is a manual helper method to restock the inventory.
   * @param productInventory ProductInventory to restock
   */
  @PostMapping("/inventory/restock")
  public void shipmentRegistered(@RequestBody ProductInventory productInventory){
    daprClient.saveState(DAPR_INVENTORY_COMPONENT, productInventory.productId(), productInventory).block();
  }


  /**
   *  This endpoint is a manual helper method to check the inventory.
   * @param productId product Id that
   */
  @PostMapping("/inventory/{productId}")
  public ResponseEntity<ProductInventory> checkInventory(@PathVariable("productId") String productId){
    State<ProductInventory> productInventoryState = daprClient.getState(DAPR_INVENTORY_COMPONENT, productId, ProductInventory.class).block();
      if(productInventoryState != null) {
        ProductInventory productInventory = productInventoryState.getValue();
        if (productInventory == null) {
          return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(productInventory);
      }else{
        return ResponseEntity.notFound().build();
      }
  }

  @GetMapping("/output")
  public OrderStatus getOutput(@RequestParam("instanceId") String instanceId){
    WorkflowInstanceStatus instanceState = daprWorkflowClient.getInstanceState(instanceId, true);
    assert instanceState != null;
    return instanceState.readOutputAs(OrderStatus.class);
  }






}

