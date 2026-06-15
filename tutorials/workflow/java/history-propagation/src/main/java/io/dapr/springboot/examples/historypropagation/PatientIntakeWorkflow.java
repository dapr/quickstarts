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

import io.dapr.springboot.examples.historypropagation.activities.VerifyInsuranceActivity;
import io.dapr.springboot.examples.historypropagation.models.InsuranceResult;
import io.dapr.springboot.examples.historypropagation.models.PatientRecord;
import io.dapr.springboot.examples.historypropagation.models.PrescriptionResult;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import io.dapr.workflows.WorkflowTaskOptions;
import org.slf4j.Logger;
import org.springframework.stereotype.Component;

/**
 * Root workflow. Verifies insurance, then invokes PrescribeMedicationWorkflow
 * with {@code WorkflowTaskOptions.propagateLineage()} so the child sees this
 * workflow's events (and forwards them further as part of its own lineage
 * propagation downstream).
 */
@Component
public class PatientIntakeWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      Logger logger = ctx.getLogger();
      PatientRecord rec = ctx.getInput(PatientRecord.class);
      logger.info("Starting intake for patient {}", rec.getPatientId());

      ctx.getPropagatedHistory().ifPresentOrElse(
          h -> logger.warn("Unexpected propagated history at root: scope={}", h.getScope()),
          () -> logger.info("PROPAGATION-DEMO: root workflow received no propagated history (expected)"));

      InsuranceResult insurance = ctx.callActivity(
          VerifyInsuranceActivity.class.getName(), rec, InsuranceResult.class).await();
      if (!insurance.isApproved()) {
        logger.warn("Insurance verification failed for patient {}", rec.getPatientId());
        ctx.complete(new PrescriptionResult(false, null, rec.getPatientId(), rec.getMedication()));
        return;
      }
      logger.info("Insurance verified: policy {}", insurance.getPolicyNumber());

      // When propagateHistory is false, the child workflow receives no
      // propagated history and ComplianceAudit cannot verify the upstream
      // VerifyInsurance/CheckAllergies/ScreenDrugInteractions steps - the
      // prescription is blocked and dispensed=false.
      PrescriptionResult result;
      if (rec.isPropagateHistory()) {
        logger.info("Calling PrescribeMedicationWorkflow with LINEAGE propagation");
        result = ctx.callChildWorkflow(
            PrescribeMedicationWorkflow.class.getName(),
            rec,
            null,
            WorkflowTaskOptions.propagateLineage(),
            PrescriptionResult.class).await();
      } else {
        logger.info("Calling PrescribeMedicationWorkflow WITHOUT propagation (failure scenario)");
        result = ctx.callChildWorkflow(
            PrescribeMedicationWorkflow.class.getName(),
            rec,
            PrescriptionResult.class).await();
      }

      logger.info("Prescription pipeline complete: dispensed={}", result.isDispensed());
      ctx.complete(result);
    };
  }
}
