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

package io.dapr.springboot.examples.versioning;

import io.dapr.spring.workflows.config.annotations.WorkflowMetadata;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;


public class PatchedWorkflow {
  public static final String NAME = "notify_patch_user";

  @WorkflowMetadata(name = NAME)
  @ConditionalOnProperty(name = "workflow.patched.enabled", havingValue = "false")
  public static class PatchedWorkflowOriginal implements Workflow {
    @Override
    public WorkflowStub create() {
      return ctx -> {
        ctx.getLogger().info("Starting Workflow: " + ctx.getName());
        var input = ctx.getInput(String.class);
        String result = ctx.callActivity(SendEmail.NAME, input, String.class).await();
        ctx.complete(result);
      };
    }
  }

  @WorkflowMetadata(name = NAME)
  @ConditionalOnProperty(name = "workflow.patched.enabled", havingValue = "true")
  public static class PatchedWorkflowAfterPatch implements Workflow {
    @Override
    public WorkflowStub create() {
      return ctx -> {
        ctx.getLogger().info("Starting Workflow: " + ctx.getName());
        var input = ctx.getInput(String.class);
        String result;

        if (ctx.isPatched("notify_patch_user_v2")){
          result = ctx.callActivity(SendSms.NAME, input, String.class).await();
        } else {
          result = ctx.callActivity(SendEmail.NAME, input, String.class).await();
        }

        ctx.complete(result);
      };
    }
  }
}
