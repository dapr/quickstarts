/*
 * Copyright 2023 The Dapr Authors
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

package io.dapr.springboot.examples.workflowapp;

import io.dapr.durabletask.Task;
import io.dapr.durabletask.TaskCanceledException;
import io.dapr.springboot.examples.workflowapp.activities.*;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.List;

@Component
public class OrderWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {

      var order = ctx.getInput(Order.class);

      // First two independent activities are called in parallel (fan-out/fan-in pattern):
      var inventoryTask = ctx.callActivity(CheckInventoryActivity.class.getName(), order.orderItem(), ActivityResult.class);

      var shippingDestinationTask = ctx.callActivity(
              CheckShippingDestinationActivity.class.getName(), order, ActivityResult.class);

      List<Task<ActivityResult>> tasks = List.of(inventoryTask, shippingDestinationTask);

      var tasksResult = ctx.allOf(tasks).await();

      if( tasksResult.stream().anyMatch(r -> !r.isSuccess())){
        var message = "Order processing failed. Reason: " + tasksResult.get(0).message();
        ctx.complete(new OrderStatus(false, message);
      }


      // Two activities are called in sequence (chaining pattern) where the UpdateInventory
      // activity is dependent on the result of the ProcessPayment activity:
      var paymentResult = ctx.callActivity(ProcessPaymentActivity.class.getName(), order.orderItem(), ActivityResult.class).await();

      if(paymentResult.isSuccess()){
        var inventoryResult = ctx.callActivity(ProcessPaymentActivity.class.getName(), order.orderItem(), UpdateInventoryResult.class).await();
      }

      ShipmentRegistrationStatus shipmentRegistrationStatus = null;
      try
      {
        // The RegisterShipment activity is using pub/sub messaging to communicate with the ShippingApp.
        ctx.callActivity(RegisterShipmentActivity.class.getName(), order.orderItem(), RegisterShipmentResult.class).await();

        // The ShippingApp will also use pub/sub messaging back to the WorkflowApp and raise an event.
        // The workflow will wait for the event to be received or until the timeout occurs.
        shipmentRegistrationStatus = ctx.waitForExternalEvent("", Duration.ofSeconds(300), ShipmentRegistrationStatus.class).await();
      } catch (TaskCanceledException tce){
        // Timeout occurred, the shipment-registered-event was not received.
        var message = "ShipmentRegistrationStatus for " + order.id() + " timed out.";
        ctx.complete(new OrderStatus(false, message));
      }

      assert shipmentRegistrationStatus != null;

      if (!shipmentRegistrationStatus.isSuccess())
      {
        // This is the compensation step in case the shipment registration event was not successful.
        ctx.callActivity(ReimburseCustomerActivity.class.getName(), order);
        var message = "ShipmentRegistrationStatus for {order.Id} failed. Customer is reimbursed.";
        ctx.complete(new OrderStatus(false, message));
      }

      ctx.complete(new OrderStatus(true, "Order " + order.id() + " processed successfully."));

    };
  }
}

