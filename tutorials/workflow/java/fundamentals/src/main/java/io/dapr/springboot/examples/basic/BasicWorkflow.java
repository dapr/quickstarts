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

package io.dapr.springboot.examples.basic;

import io.dapr.springboot.examples.basic.activities.Activity1;
import io.dapr.springboot.examples.basic.activities.Activity2;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import org.springframework.stereotype.Component;

@Component
public class BasicWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      ctx.getLogger().info("Starting Workflow: {}", ctx.getName());

      var input = ctx.getInput(String.class);

      var result1 = ctx.callActivity(Activity1.class.getName(), input, String.class).await();
      var result2 = ctx.callActivity(Activity2.class.getName(), result1, String.class).await();

      ctx.complete(result2);
    };
  }
}
