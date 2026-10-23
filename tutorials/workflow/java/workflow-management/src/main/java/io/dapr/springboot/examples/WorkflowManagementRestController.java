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
import io.dapr.springboot.examples.mgmt.NeverEndingWorkflow;
import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.TimeoutException;

@RestController
@EnableDaprWorkflows
public class WorkflowManagementRestController {

  private final Logger logger = LoggerFactory.getLogger(WorkflowManagementRestController.class);

  @Autowired
  private DaprWorkflowClient daprWorkflowClient;


  /**
   * Run NeverEnding Workflow
   *
   * @return the instanceId of the NeverEndingWorkflow execution
   */
  @PostMapping("start/{counter}")
  public String start(@PathVariable("counter") Integer counter) throws TimeoutException {
    return daprWorkflowClient.scheduleNewWorkflow(NeverEndingWorkflow.class, counter);
  }

  /**
   * Obtain the status of the workflow
   *
   * @return the output of the NeverEndingWorkflow execution
   */
  @GetMapping("status/{instanceId}")
  public String status(@PathVariable("instanceId") String instanceId) {
    WorkflowInstanceStatus instanceState = daprWorkflowClient.getInstanceState(instanceId, true);
    if (instanceState != null) {
      return instanceState.toString();
    }
    return "N/A";
  }

  /**
   * Suspend Workflow Instance
   *
   */
  @PostMapping("suspend/{instanceId}")
  public void suspend(@PathVariable("instanceId") String instanceId) {
    daprWorkflowClient.suspendWorkflow(instanceId, "");
  }

  /**
   * Resume Workflow Instance
   */
  @PostMapping("resume/{instanceId}")
  public void resume(@PathVariable("instanceId") String instanceId) {
    daprWorkflowClient.resumeWorkflow(instanceId, "");
  }

  /**
   * Terminate Workflow Instance
   */
  @PostMapping("terminate/{instanceId}")
  public void terminate(@PathVariable("instanceId") String instanceId) {
    daprWorkflowClient.terminateWorkflow(instanceId, null);
  }

  /**
   * Purge Workflow Instance
   */
  @DeleteMapping("purge/{instanceId}")
  public boolean purge(@PathVariable("instanceId") String instanceId) {
    return daprWorkflowClient.purgeInstance(instanceId);
  }


}
