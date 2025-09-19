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
import io.dapr.springboot.examples.monitor.MonitorWorkflow;
import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeoutException;

@RestController
@EnableDaprWorkflows
public class MonitorRestController {

  private final Logger logger = LoggerFactory.getLogger(MonitorRestController.class);

  @Autowired
  private DaprWorkflowClient daprWorkflowClient;

  /*
   * **Note:** This local variable is used for examples purposes only.
   * For production scenarios, you will need to map workflowInstanceIds to your business scenarios.
   */
  private String instanceId;

  /**
   * Run Monitor Pattern Demo Workflow
   *
   * @return the instanceId of the MonitorWorkflow execution
   */
  @PostMapping("start/{counter}")
  public String monitor(@PathVariable("counter") Integer counter) throws TimeoutException {
    instanceId = daprWorkflowClient.scheduleNewWorkflow(MonitorWorkflow.class, counter);
    return instanceId;
  }

  /**
   * Obtain the output of the workflow
   *
   * @return the output of the MonitorWorkflow execution
   */
  @GetMapping("output")
  public String output() throws TimeoutException {
    WorkflowInstanceStatus instanceState = daprWorkflowClient.getInstanceState(instanceId, true);
    if (instanceState != null) {
      return instanceState.readOutputAs(String.class);
    }
    return "N/A";
  }


}
