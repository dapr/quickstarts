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

package io.dapr.springboot.examples.fanoutfanin;

import io.dapr.durabletask.Task;
import io.dapr.workflows.Workflow;
import io.dapr.workflows.WorkflowStub;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class FanOutFanInWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
        ctx.getLogger().info("Starting Workflow: {}", ctx.getName());

        List<String> inputs = ctx.getInput(List.class);
        if (inputs.isEmpty()) {
          throw new IllegalStateException("Input cannot be empty.");
        }
        // This list will contain the tasks that will be executed by the Dapr Workflow engine.
        List<Task<WordLength>> tasks = inputs.stream()
                .map(input -> ctx.callActivity(GetWordLengthActivity.class.getName(), input,
                        WordLength.class))
                .collect(Collectors.toList());

        // The Dapr Workflow engine will schedule all the tasks and wait for all tasks to complete before continuing.
        List<WordLength> allWordLengths = ctx.allOf(tasks).await();
        //Let's sort the list of WordLengths
        allWordLengths.sort(Comparator.comparingInt(WordLength::length));
        //Pick the first one
        String shortestWord = allWordLengths.get(0).word();

        ctx.complete(shortestWord);
    };
  }
  record WordLength(String word, int length) implements Serializable {}
}
