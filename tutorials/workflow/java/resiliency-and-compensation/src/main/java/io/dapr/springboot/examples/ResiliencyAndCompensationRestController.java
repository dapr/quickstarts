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
import io.dapr.springboot.examples.resiliency.ResiliencyAndCompensationWorkflow;
import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.TimeoutException;

@RestController
@EnableDaprWorkflows
public class ResiliencyAndCompensationRestController {

  private final Logger logger = LoggerFactory.getLogger(ResiliencyAndCompensationRestController.class);

  @Autowired
  private DaprWorkflowClient daprWorkflowClient;

  /*
   * **Note:** This local variable is used for examples purposes only.
   * For production scenarios, you will need to map workflowInstanceIds to your business scenarios.
   */
  private String instanceId;

  /**
   * Run Resiliency And Compensation Workflow
   *
   * @return the instanceId of the ResiliencyAndCompensationWorkflow execution
   */
  @PostMapping("start/{input}")
  public String start(@PathVariable("input") Integer input) throws TimeoutException {
    instanceId = daprWorkflowClient.scheduleNewWorkflow(ResiliencyAndCompensationWorkflow.class, input);
    return instanceId;
  }



  /**
   * Obtain the output of the workflow
   *
   * @return the output of the Resiliency And Compensation Workflow
   *   (-1 means, it didn't find any output)
   */
  @GetMapping("output")
  public Integer output() throws TimeoutException {
    WorkflowInstanceStatus instanceState = daprWorkflowClient.getInstanceState(instanceId, true);
    if (instanceState != null) {
      return instanceState.readOutputAs(Integer.class);
    }
    return -1;
  }
}
