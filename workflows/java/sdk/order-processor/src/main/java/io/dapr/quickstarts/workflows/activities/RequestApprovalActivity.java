package io.dapr.quickstarts.workflows.activities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.quickstarts.workflows.models.ApprovalResult;
import io.dapr.quickstarts.workflows.models.OrderPayload;
import io.dapr.workflows.runtime.WorkflowActivity;
import io.dapr.workflows.runtime.WorkflowActivityContext;

public class RequestApprovalActivity implements WorkflowActivity {
  private static Logger logger = LoggerFactory.getLogger(RequestApprovalActivity.class);

  @Override
  public Object run(WorkflowActivityContext ctx) {
    OrderPayload order = ctx.getInput(OrderPayload.class);
    logger.info("Requesting approval for order: {}", order);

    // hard code to Approved in example
    logger.info("Approved requesting approval for order: {}", order);
    return ApprovalResult.Approved;
  }

}
