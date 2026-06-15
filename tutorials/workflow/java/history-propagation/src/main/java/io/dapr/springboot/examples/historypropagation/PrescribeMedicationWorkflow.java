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

import io.dapr.durabletask.HistoryPropagationScope;
import io.dapr.durabletask.PropagatedHistory;
import io.dapr.springboot.examples.historypropagation.activities.CheckAllergiesActivity;
import io.dapr.springboot.examples.historypropagation.activities.DispenseMedicationActivity;
import io.dapr.springboot.examples.historypropagation.activities.ScreenDrugInteractionsActivity;
import io.dapr.springboot.examples.historypropagation.models.AuditResult;
import io.dapr.springboot.examples.historypropagation.models.DispenseResult;
import io.dapr.springboot.examples.historypropagation.models.PatientRecord;
import io.dapr.springboot.examples.historypropagation.models.PrescriptionResult;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import io.dapr.workflows.WorkflowTaskOptions;
import org.slf4j.Logger;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Child workflow invoked by PatientIntakeWorkflow with
 * {@code WorkflowTaskOptions.propagateLineage()}. Calls:
 * <ul>
 *   <li>{@code ComplianceAuditWorkflow} with {@code propagateLineage()} -
 *       grandchild sees both PatientIntake and PrescribeMedication events.</li>
 *   <li>{@code DispenseMedicationActivity} with {@code propagateOwnHistory()} -
 *       activity sees ONLY PrescribeMedication events (trust boundary).</li>
 * </ul>
 */
@Component
public class PrescribeMedicationWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      Logger logger = ctx.getLogger();
      PatientRecord rec = ctx.getInput(PatientRecord.class);
      logger.info("Starting prescription: {} {}mg for {}",
          rec.getMedication(), rec.getDosage(), rec.getCondition());

      Optional<PropagatedHistory> historyOpt = ctx.getPropagatedHistory();
      historyOpt.ifPresent(h -> {
        logger.info("PROPAGATION-DEMO: scope={} workflows={}",
            h.getScope(), h.getWorkflows().size());
        if (h.getScope() != HistoryPropagationScope.LINEAGE) {
          logger.warn("Expected LINEAGE from parent but got {}", h.getScope());
        }
      });

      ctx.callActivity(CheckAllergiesActivity.class.getName(), rec, Boolean.class).await();
      ctx.callActivity(ScreenDrugInteractionsActivity.class.getName(), rec, Boolean.class).await();

      AuditResult audit = ctx.callChildWorkflow(
          ComplianceAuditWorkflow.class.getName(),
          rec,
          null,
          WorkflowTaskOptions.propagateLineage(),
          AuditResult.class).await();
      logger.info("Compliance audit returned: compliant={}", audit.isCompliant());

      if (!audit.isCompliant()) {
        logger.warn("Audit blocked dispensing - aborting prescription");
        ctx.complete(new PrescriptionResult(false, null, rec.getPatientId(), rec.getMedication()));
        return;
      }

      DispenseResult dispense = ctx.callActivity(
          DispenseMedicationActivity.class.getName(),
          rec,
          WorkflowTaskOptions.propagateOwnHistory(),
          DispenseResult.class).await();
      logger.info("Dispense returned: id={}", dispense.getDispenseId());

      ctx.complete(new PrescriptionResult(true, dispense.getDispenseId(),
          rec.getPatientId(), rec.getMedication()));
    };
  }
}
