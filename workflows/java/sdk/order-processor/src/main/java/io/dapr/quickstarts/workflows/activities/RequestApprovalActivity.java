package io.dapr.quickstarts.workflows.activities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.workflows.WorkflowActivity;
import io.dapr.workflows.WorkflowActivityContext;

public class RequestApprovalActivity implements WorkflowActivity {
  private static Logger logger = LoggerFactory.getLogger(RequestApprovalActivity.class);

  @Override
  public Object run(WorkflowActivityContext ctx) {
    String orderId = ctx.getInput(String.class);
    logger.info("Requesting approval for order: {}", orderId);

    // Simulate slow processing & sending the approval to the recipient
    try {
      Thread.sleep(2 * 1000);
    } catch (InterruptedException e) {
    }

    System.out.println("Approval requested for order " + orderId + ". Waiting for approval.");

    return "";
  }

}
