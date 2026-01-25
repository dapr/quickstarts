package io.dapr.quickstarts.workflows.activities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.quickstarts.workflows.models.OrderPayload;
import io.dapr.workflows.WorkflowActivity;
import io.dapr.workflows.WorkflowActivityContext;

public class RequestApprovalActivity implements WorkflowActivity {
  private static Logger logger = LoggerFactory.getLogger(RequestApprovalActivity.class);

  @Override
  public Object run(WorkflowActivityContext ctx) {
    OrderPayload order = ctx.getInput(OrderPayload.class);
    logger.info("Requesting approval for order: {}", order);

    // Simulate slow processing & sending the approval to the recipient
    try {
      Thread.sleep(2 * 1000);
    } catch (InterruptedException e) {
    }

    return "";
  }

}
