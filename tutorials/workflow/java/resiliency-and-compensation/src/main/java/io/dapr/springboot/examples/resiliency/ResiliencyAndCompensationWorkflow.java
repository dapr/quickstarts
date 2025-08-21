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

package io.dapr.springboot.examples.resiliency;

import io.dapr.durabletask.CompositeTaskFailedException;
import io.dapr.durabletask.TaskFailedException;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import io.dapr.workflows.WorkflowTaskOptions;
import io.dapr.workflows.WorkflowTaskRetryPolicy;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class ResiliencyAndCompensationWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {

      var counter = ctx.getInput(Integer.class);

      WorkflowTaskRetryPolicy workflowTaskRetryPolicy = new WorkflowTaskRetryPolicy(3,
              Duration.ofSeconds(2),
              1.0,
              Duration.ofSeconds(10),
              Duration.ofSeconds(15));

      WorkflowTaskOptions defaultActivityRetryOptions = new WorkflowTaskOptions(workflowTaskRetryPolicy);

      Integer result1 = ctx.callActivity(MinusOneActivity.class.getName(), counter, defaultActivityRetryOptions, Integer.class).await();

      Integer workflowResult = 0;
      try {
        workflowResult = ctx.callActivity(DivisionActivity.class.getName(), result1, defaultActivityRetryOptions, Integer.class).await();
      } catch (TaskFailedException wtfe) {

        // Something went wrong in the Division activity which is not recoverable.
        // Perform a compensation action for the MinusOne activity to revert any
        // changes made in that activity.
        if( wtfe.getErrorDetails().isCausedBy(ArithmeticException.class)) {
          workflowResult = ctx.callActivity(PlusOneActivity.class.getName(), result1, defaultActivityRetryOptions, Integer.class).await();
          //@TODO: not supported yet
          //ctx.setCustomStatus()
        }
      }

      ctx.complete(workflowResult);
    };
  }
}
