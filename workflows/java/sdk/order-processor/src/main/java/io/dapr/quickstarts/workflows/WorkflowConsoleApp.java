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
 * limitations under the License.
*/

package io.dapr.quickstarts.workflows;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.logging.Level;
import java.util.logging.Logger;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import io.dapr.quickstarts.workflows.activities.NotifyActivity;
import io.dapr.quickstarts.workflows.activities.ProcessPaymentActivity;
import io.dapr.quickstarts.workflows.activities.RequestApprovalActivity;
import io.dapr.quickstarts.workflows.activities.VerifyInventoryActivity;
import io.dapr.quickstarts.workflows.activities.UpdateInventoryActivity;
import io.dapr.quickstarts.workflows.models.InventoryItem;
import io.dapr.quickstarts.workflows.models.OrderPayload;
import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;
import io.dapr.workflows.runtime.WorkflowRuntime;
import io.dapr.workflows.runtime.WorkflowRuntimeBuilder;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;

public class WorkflowConsoleApp {

  private static final String STATE_STORE_NAME = "statestore";
  private static final String ITEM_NAME = "cars";
  private static final int PER_ITEM_COST = 5000;
  private static final int ORDER_QUANTITY = 2;

  // Keep a reference so the log level stays set.
  private static final Logger DURABLE_TASK_LOGGER = Logger.getLogger("io.dapr.durabletask");

  /**
   * The main method of this console app.
   *
   * @param args The port the app will listen on.
   * @throws Exception An Exception.
   */
  public static void main(String[] args) throws Exception {
    // Hide the internal SDK messages. Keep the warnings.
    DURABLE_TASK_LOGGER.setLevel(Level.WARNING);

    System.out.println("*** Welcome to the Dapr Workflow console app sample!");
    System.out.println("*** Using this app, you can place orders that start workflows.");

    String orderId = System.getenv("ORDER_ID");
    if (orderId == null || orderId.isBlank()) {
      orderId = "order-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
    }
    System.out.println("Order ID: " + orderId);

    // Wait for the sidecar to become available
    Thread.sleep(5 * 1000);

    // Register the OrderProcessingWorkflow and its activities with the builder.
    WorkflowRuntimeBuilder builder = new WorkflowRuntimeBuilder().registerWorkflow(OrderProcessingWorkflow.class);
    builder.registerActivity(NotifyActivity.class);
    builder.registerActivity(ProcessPaymentActivity.class);
    builder.registerActivity(RequestApprovalActivity.class);
    builder.registerActivity(VerifyInventoryActivity.class);
    builder.registerActivity(UpdateInventoryActivity.class);

    // Build and then start the workflow runtime pulling and executing tasks
    WorkflowRuntime runtime = builder.build();
    System.out.println("Start workflow runtime");
    runtime.start(false);

    restockInventoryIfAbsent();

    DaprWorkflowClient workflowClient = new DaprWorkflowClient();
    try (workflowClient) {
      executeWorkflow(workflowClient, orderId);
    }
    System.exit(0);
  }

  private static void executeWorkflow(DaprWorkflowClient workflowClient, String orderId) throws Exception {
    // Look for an instance with this ID. A restart finds the instance that the first run started.
    // A missing instance comes back as a status with an empty name.
    WorkflowInstanceStatus existing = getInstanceStateWhenReady(workflowClient, orderId);
    if (existing == null || existing.getName() == null || existing.getName().isEmpty()) {
      OrderPayload order = new OrderPayload();
      order.setItemName(ITEM_NAME);
      order.setQuantity(ORDER_QUANTITY);
      order.setTotalCost(ORDER_QUANTITY * PER_ITEM_COST);
      workflowClient.scheduleNewWorkflow(OrderProcessingWorkflow.class, order, orderId);
      System.out.printf("Started order %s.%n", orderId);
    } else if (existing.isCompleted()) {
      System.out.printf("Workflow completed: %s%n", existing.getRuntimeStatus().name());
      return;
    } else {
      System.out.printf("Order %s is already running. Waiting for it to finish.%n", orderId);
    }

    WorkflowInstanceStatus status = workflowClient.waitForInstanceCompletion(orderId, Duration.ofMinutes(15), true);
    if (status != null) {
      System.out.printf("Workflow completed: %s%n", status.getRuntimeStatus().name());
    } else {
      System.out.printf("Order %s not found%n", orderId);
    }
  }

  // Right after the sidecar starts, its workflow runtime can answer UNAVAILABLE.
  // Try again every second, for up to 60 seconds.
  private static WorkflowInstanceStatus getInstanceStateWhenReady(DaprWorkflowClient workflowClient, String orderId)
      throws InterruptedException {
    for (int attempt = 1; ; attempt++) {
      try {
        return workflowClient.getInstanceState(orderId, false);
      } catch (StatusRuntimeException e) {
        if (e.getStatus().getCode() != Status.Code.UNAVAILABLE || attempt >= 60) {
          throw e;
        }
        Thread.sleep(1000);
      }
    }
  }

  private static void restockInventoryIfAbsent() {
    DaprClient daprClient = new DaprClientBuilder().build();
    // Write the inventory only when it is not there yet, so a restart does not restock.
    State<InventoryItem> current = daprClient.getState(STATE_STORE_NAME, ITEM_NAME, InventoryItem.class).block();
    if (current != null && current.getValue() != null) {
      return;
    }
    InventoryItem inventory = new InventoryItem();
    inventory.setName(ITEM_NAME);
    inventory.setPerItemCost(PER_ITEM_COST);
    inventory.setQuantity(10);
    daprClient.saveState(STATE_STORE_NAME, ITEM_NAME, inventory).block();
  }
}
