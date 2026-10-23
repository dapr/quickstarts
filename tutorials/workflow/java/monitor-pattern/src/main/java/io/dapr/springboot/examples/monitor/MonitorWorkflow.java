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

package io.dapr.springboot.examples.monitor;

import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class MonitorWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {

      var counter = ctx.getInput(Integer.class);

      Status status = ctx.callActivity(CheckStatusActivity.class.getName(), counter, Status.class).await();

      if(!status.isReady()){
        ctx.createTimer(Duration.ofSeconds(1)).await();
        counter++;
        ctx.continueAsNew(counter);
      }

      ctx.complete("Status is healthy after checking " + counter + " times.");
    };
  }
}
