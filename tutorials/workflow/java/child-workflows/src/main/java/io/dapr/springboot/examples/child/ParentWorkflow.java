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

package io.dapr.springboot.examples.child;

import io.dapr.durabletask.Task;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ParentWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      ctx.getLogger().info("Starting Workflow: {}", ctx.getName());

      List<String> inputs = ctx.getInput(List.class);

      List<Task<String>> tasks = inputs.stream()
              .map(input -> ctx.callChildWorkflow(ChildWorkflow.class.getName(), input, String.class))
              .collect(Collectors.toList());

      // Fan-in to get the total word count from all the individual activity results.
      List<String> allChildWorkflowsResults = ctx.allOf(tasks).await();

      ctx.complete(allChildWorkflowsResults);
    };
  }
}
