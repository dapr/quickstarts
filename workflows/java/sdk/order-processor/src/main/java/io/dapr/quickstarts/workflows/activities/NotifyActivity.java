package io.dapr.quickstarts.workflows.activities;

import io.dapr.workflows.WorkflowActivity;
import io.dapr.workflows.WorkflowActivityContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.quickstarts.workflows.models.Notification;

public class NotifyActivity implements WorkflowActivity {
  private static Logger logger = LoggerFactory.getLogger(NotifyActivity.class);

  @Override
  public Object run(WorkflowActivityContext ctx) {
    Notification notification = ctx.getInput(Notification.class);
    logger.info(notification.getMessage());

    return "";
  }

}
