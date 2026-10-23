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

package io.dapr.springboot.examples.historypropagation.activities;

import io.dapr.durabletask.ActivityResult;
import io.dapr.durabletask.HistoryPropagationScope;
import io.dapr.durabletask.PropagatedHistory;
import io.dapr.durabletask.WorkflowResult;
import io.dapr.springboot.examples.historypropagation.models.DispenseResult;
import io.dapr.springboot.examples.historypropagation.models.PatientRecord;
import io.dapr.workflows.WorkflowActivity;
import io.dapr.workflows.WorkflowActivityContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Pharmacy dispense step. Invoked by the parent workflow with
 * {@code WorkflowTaskOptions.propagateOwnHistory()} - this activity sees only
 * the direct caller's events, never the grandparent chain.
 */
@Component
public class DispenseMedicationActivity implements WorkflowActivity {
  private static final Logger logger = LoggerFactory.getLogger(DispenseMedicationActivity.class);

  @Override
  public Object run(WorkflowActivityContext ctx) {
    PatientRecord rec = ctx.getInput(PatientRecord.class);

    Optional<PropagatedHistory> historyOpt = ctx.getPropagatedHistory();
    int reviewedWorkflows = 0;
    if (historyOpt.isPresent()) {
      PropagatedHistory history = historyOpt.get();
      reviewedWorkflows = history.getWorkflows().size();
      logger.info("PROPAGATION-DEMO: scope={} workflows={}",
          history.getScope(), reviewedWorkflows);
      for (WorkflowResult wf : history.getWorkflows()) {
        logger.info("  ancestor workflow: name={} app={} instance={}",
            wf.getName(), wf.getAppId(), wf.getInstanceId());
        Optional<ActivityResult> allergyCheck = wf.getLastActivityByName(
            CheckAllergiesActivity.class.getName());
        allergyCheck.ifPresent(a -> logger.info(
            "  upstream activity CheckAllergiesActivity: completed={} failed={}",
            a.isCompleted(), a.isFailed()));
      }
      if (history.getScope() != HistoryPropagationScope.OWN_HISTORY) {
        logger.warn("Expected OWN_HISTORY but got {}", history.getScope());
      }
    } else {
      logger.info("No propagated history received - dispense activity invoked without propagation");
    }

    String dispenseId = "rx-" + rec.getPatientId() + "-" + System.currentTimeMillis();
    logger.info("DISPENSED: {} ({} {}mg) for patient {}",
        dispenseId, rec.getMedication(), rec.getDosage(), rec.getPatientId());

    return new DispenseResult(dispenseId, "dispensed", reviewedWorkflows);
  }
}
