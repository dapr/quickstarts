package io.dapr.quickstarts.saga.activities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.workflows.runtime.WorkflowActivity;
import io.dapr.workflows.runtime.WorkflowActivityContext;

public class DeliveryActivity implements WorkflowActivity {
    private static Logger logger = LoggerFactory.getLogger(DeliveryActivity.class);

  @Override
  public Object run(WorkflowActivityContext ctx) {
    // in this quickstart, we assume that the Delivery will be failed
    // So that the workflow will be failed and compensated
    logger.info("Delivery failed");
    throw new RuntimeException("Delivery failed");
  }

}
