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
import io.dapr.springboot.examples.chain.ChainingWorkflow;
import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeoutException;

@RestController
@EnableDaprWorkflows
public class TaskChainingRestController {

  private final Logger logger = LoggerFactory.getLogger(TaskChainingRestController.class);

  @Autowired
  private DaprWorkflowClient daprWorkflowClient;

  private String instanceId;

  /**
   * Run Chain Demo Workflow
   *
   * @return the instanceId of the ChainWorkflow execution
   */
  @PostMapping("start")
  public String chain() throws TimeoutException {
    instanceId = daprWorkflowClient.scheduleNewWorkflow(ChainingWorkflow.class, "This");
    return instanceId;
  }

  /**
   * Obtain the output of the workflow
   *
   * @return the output of the ChainWorkflow execution
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
