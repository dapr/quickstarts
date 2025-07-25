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

package io.dapr.springboot.examples;


import io.dapr.spring.workflows.config.EnableDaprWorkflows;
import io.dapr.springboot.examples.workflowapp.OrderStatus;
import io.dapr.springboot.examples.workflowapp.OrderWorkflow;
import io.dapr.springboot.examples.workflowapp.Order;
import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;
import io.dapr.workflows.client.WorkflowRuntimeStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

  @Autowired
  private DaprWorkflowClient daprWorkflowClient;

  private String instanceId;

  /**
   * The DaprWorkflowClient is the API to manage workflows.
   * Here it is used to schedule a new workflow instance.
   *
   * @return the instanceId of the ExternalEventsWorkflow execution
   */
  @PostMapping("start")
  public String basic(@RequestBody Order order) throws TimeoutException {
    logger.info("Received order: {}", order);
    instanceId = daprWorkflowClient.scheduleNewWorkflow(OrderWorkflow.class, order);
    return instanceId;
  }

  /**
   * Obtain the status of the workflow
   *
   * @return the status of the ExternalEventsWorkflow instance
   */
  @GetMapping("status")
  public String status() throws TimeoutException {
    if(instanceId != null && !instanceId.isEmpty()) {
      WorkflowInstanceStatus instanceState = daprWorkflowClient.getInstanceState(instanceId, true);
      if (instanceState != null) {
        if (instanceState.getRuntimeStatus().equals(WorkflowRuntimeStatus.COMPLETED)) {
          var output = instanceState.readOutputAs(String.class);
          if (output != null && !output.isEmpty()) {
            return "Workflow Instance (" + instanceId + ") Status: " + instanceState.getRuntimeStatus().name() + "\n"
                    + "Output: " + output;
          }
        }
        return "Workflow Instance (" + instanceId + ") Status: " + instanceState.getRuntimeStatus().name();
      }
    }
    return "N/A";
  }

  /**
   * Raise a workflow event
   */
  @PostMapping("event")
  public void raiseEvent(@RequestBody OrderStatus approvalStatus)  {
    daprWorkflowClient.raiseEvent(instanceId, "approval-event", approvalStatus);
  }


}

