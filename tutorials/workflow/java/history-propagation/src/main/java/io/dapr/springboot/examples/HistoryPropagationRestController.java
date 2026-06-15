/*
 * Copyright 2026 The Dapr Authors
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

package io.dapr.springboot.examples;

import io.dapr.spring.workflows.config.EnableDaprWorkflows;
import io.dapr.springboot.examples.historypropagation.PatientIntakeWorkflow;
import io.dapr.springboot.examples.historypropagation.models.PatientRecord;
import io.dapr.springboot.examples.historypropagation.models.PrescriptionResult;
import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeoutException;

@RestController
@EnableDaprWorkflows
public class HistoryPropagationRestController {

  @Autowired
  private DaprWorkflowClient daprWorkflowClient;

  /*
   * For example purposes only. In production, map workflowInstanceIds to your
   * own business identifiers.
   */
  private String instanceId;

  /**
   * Start the PatientIntake workflow with the given patient record.
   *
   * @param record the patient record
   * @return the workflow instance id
   */
  @PostMapping("start")
  public String start(@RequestBody PatientRecord record) {
    instanceId = daprWorkflowClient.scheduleNewWorkflow(PatientIntakeWorkflow.class, record);
    return instanceId;
  }

  /**
   * Get the output of the last started PatientIntake workflow.
   *
   * @return the prescription result, or a placeholder if not yet available
   */
  @GetMapping("output")
  public PrescriptionResult output() throws TimeoutException {
    WorkflowInstanceStatus state = daprWorkflowClient.getInstanceState(instanceId, true);
    if (state != null) {
      return state.readOutputAs(PrescriptionResult.class);
    }
    return new PrescriptionResult(false, null, null, null);
  }
}
