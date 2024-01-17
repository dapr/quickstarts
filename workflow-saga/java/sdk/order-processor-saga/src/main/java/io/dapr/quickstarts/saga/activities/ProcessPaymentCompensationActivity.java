package io.dapr.quickstarts.saga.activities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.quickstarts.saga.models.PaymentRequest;
import io.dapr.workflows.runtime.WorkflowActivity;
import io.dapr.workflows.runtime.WorkflowActivityContext;

public class ProcessPaymentCompensationActivity implements WorkflowActivity {
  private static Logger logger = LoggerFactory.getLogger(ProcessPaymentCompensationActivity.class);

  @Override
  public Object run(WorkflowActivityContext ctx) {
    PaymentRequest input = ctx.getInput(PaymentRequest.class);

    logger.info("Compensating payment for request ID '{}' at ${}",
        input.getRequestId(), input.getAmount());

    // Simulate slow processing
    try {
      Thread.sleep(1 * 1000);
    } catch (InterruptedException e) {
    }

    logger.info("Compensated payment for request ID '{}' at ${}",
        input.getRequestId(), input.getAmount());
    return null;
  }
}
