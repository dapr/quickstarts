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
import io.dapr.springboot.examples.basic.BasicWorkflow;
import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeoutException;

@RestController
/*
 * Dapr Workflows and Activities need to be registered in the DI container otherwise
 *  the Dapr runtime does not know this application contains workflows and activities.
 *  In Spring Boot Applications, the `@EnableDaprWorkflow` annotation takes care of registering
 *  all workflows and activities components found in the classpath.
 */
@EnableDaprWorkflows
public class BasicRestController {

  private final Logger logger = LoggerFactory.getLogger(BasicRestController.class);

  @Autowired
  private DaprWorkflowClient daprWorkflowClient;

  private String instanceId;

  /**
   * The DaprWorkflowClient is the API to manage workflows.
   * Here it is used to schedule a new workflow instance.
   *
   * @return the instanceId of the ChainWorkflow execution
   */
  @PostMapping("start")
  public String basic(@RequestParam("input") String input) throws TimeoutException {
    instanceId = daprWorkflowClient.scheduleNewWorkflow(BasicWorkflow.class, input);
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
