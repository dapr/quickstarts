package io.dapr.quickstarts.saga.activities;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.workflows.runtime.WorkflowActivity;
import io.dapr.workflows.runtime.WorkflowActivityContext;

public class DistributionActivity implements WorkflowActivity {
    private static Logger logger = LoggerFactory.getLogger(DistributionActivity.class);

  @Override
  public Object run(WorkflowActivityContext ctx) {
    // in this quickstart, we assume that the distribution will be failed
    // So that the workflow will be compensated
    logger.info("Distribution failed");
    throw new RuntimeException("Distribution failed");
  }

}
