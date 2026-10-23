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

package io.dapr.springboot.examples.historypropagation;

import io.dapr.durabletask.ActivityResult;
import io.dapr.durabletask.HistoryPropagationScope;
import io.dapr.durabletask.PropagatedHistory;
import io.dapr.durabletask.WorkflowResult;
import io.dapr.springboot.examples.historypropagation.activities.CheckAllergiesActivity;
import io.dapr.springboot.examples.historypropagation.activities.ScreenDrugInteractionsActivity;
import io.dapr.springboot.examples.historypropagation.activities.VerifyInsuranceActivity;
import io.dapr.springboot.examples.historypropagation.models.AuditResult;
import io.dapr.springboot.examples.historypropagation.models.PatientRecord;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import org.slf4j.Logger;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Grandchild workflow invoked by PrescribeMedicationWorkflow with
 * {@code WorkflowTaskOptions.propagateLineage()}. Sees the full ancestor chain
 * (PatientIntake + PrescribeMedication) and verifies that the required
 * upstream activities (insurance, allergies, drug interactions) actually ran
 * before approving the prescription.
 */
@Component
public class ComplianceAuditWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      Logger logger = ctx.getLogger();
      PatientRecord rec = ctx.getInput(PatientRecord.class);
      logger.info("Auditing prescription for patient {}", rec.getPatientId());

      Optional<PropagatedHistory> historyOpt = ctx.getPropagatedHistory();
      if (historyOpt.isEmpty()) {
        logger.warn("No propagated history received - cannot verify caller pipeline");
        ctx.complete(new AuditResult(false, 1.0, 0,
            "no execution history provided - cannot verify caller pipeline"));
        return;
      }

      PropagatedHistory history = historyOpt.get();
      int reviewedWorkflows = history.getWorkflows().size();
      logger.info("PROPAGATION-DEMO: scope={} workflows={}",
          history.getScope(), reviewedWorkflows);
      for (WorkflowResult wf : history.getWorkflows()) {
        logger.info("  ancestor workflow: name={} app={} instance={}",
            wf.getName(), wf.getAppId(), wf.getInstanceId());
      }

      if (history.getScope() != HistoryPropagationScope.LINEAGE) {
        logger.warn("Expected LINEAGE but got {}", history.getScope());
      }

      Optional<WorkflowResult> intakeOpt = history.getLastWorkflowByName(
          PatientIntakeWorkflow.class.getName());
      boolean insuranceVerified = intakeOpt
          .flatMap(wf -> wf.getLastActivityByName(VerifyInsuranceActivity.class.getName()))
          .map(ActivityResult::isCompleted)
          .orElse(false);

      Optional<WorkflowResult> parentOpt = history.getLastWorkflowByName(
          PrescribeMedicationWorkflow.class.getName());
      boolean allergiesChecked = parentOpt
          .flatMap(wf -> wf.getLastActivityByName(CheckAllergiesActivity.class.getName()))
          .map(ActivityResult::isCompleted)
          .orElse(false);
      boolean interactionsScreened = parentOpt
          .flatMap(wf -> wf.getLastActivityByName(ScreenDrugInteractionsActivity.class.getName()))
          .map(ActivityResult::isCompleted)
          .orElse(false);

      logger.info("  upstream activity VerifyInsurance: completed={}", insuranceVerified);
      logger.info("  upstream activity CheckAllergies: completed={}", allergiesChecked);
      logger.info("  upstream activity ScreenDrugInteractions: completed={}", interactionsScreened);

      boolean compliant = insuranceVerified && allergiesChecked && interactionsScreened;
      if (compliant) {
        logger.info("APPROVED (risk=0.10, {} workflow(s) verified)", reviewedWorkflows);
        ctx.complete(new AuditResult(true, 0.10, reviewedWorkflows,
            "all upstream checks verified"));
      } else {
        logger.warn("BLOCKED - missing upstream checks: insurance={} allergies={} interactions={}",
            insuranceVerified, allergiesChecked, interactionsScreened);
        ctx.complete(new AuditResult(false, 0.9, reviewedWorkflows,
            "missing one or more required upstream checks"));
      }
    };
  }
}
