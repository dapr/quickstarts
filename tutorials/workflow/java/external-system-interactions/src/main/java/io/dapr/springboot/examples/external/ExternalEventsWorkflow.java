/*
 * Copyright 2023 The Dapr Authors
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
limitations under the License.
*/

package io.dapr.springboot.examples.external;

import io.dapr.durabletask.TaskCanceledException;
import io.dapr.springboot.examples.external.activities.ProcessOrderActivity;
import io.dapr.springboot.examples.external.activities.RequestApprovalActivity;
import io.dapr.springboot.examples.external.activities.SendNotificationActivity;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class ExternalEventsWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      ctx.getLogger().info("Starting Workflow: {}", ctx.getName());

      var order = ctx.getInput(Order.class);

      Boolean approved = ctx.callActivity(RequestApprovalActivity.class.getName(), order, Boolean.class).await();

      var approvalStatus = new ApprovalStatus(order.id(), approved);

      if(order.totalPrice() > 250){
        try{
          approvalStatus = ctx.waitForExternalEvent("approval-event", Duration.ofSeconds(120), ApprovalStatus.class).await();
        } catch (TaskCanceledException tce){
          var notification = "Approval request for order " + order.id() + " timed out.";
          ctx.callActivity(SendNotificationActivity.class.getName(), notification).await();
          ctx.complete(notification);
        }

      }

      if (approvalStatus.isApproved()){
        ctx.callActivity(ProcessOrderActivity.class.getName(), order).await();
      }
      var notification = approvalStatus.isApproved() ?
              "Order " + order.id() + " has been approved." :
              "Order " + order.id() +" has been rejected.";

      ctx.callActivity(SendNotificationActivity.class.getName(), notification).await();

      ctx.complete(notification);
    };
  }
}

