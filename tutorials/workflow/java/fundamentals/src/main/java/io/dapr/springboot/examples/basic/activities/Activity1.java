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

package io.dapr.springboot.examples.basic.activities;

import io.dapr.workflows.WorkflowActivity;
import io.dapr.workflows.WorkflowActivityContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/*
 * Activity code typically performs a one specific task, like calling an API to store / retrieve data.
 * You can use other Dapr APIs inside an activity.
 */
@Component
public class Activity1 implements WorkflowActivity {

  /*
   * The RunAsync method is an abstract method in the abstract WorkflowActivity class that needs to be implemented.
   * This method is the entry point for the activity.
   * @param context The WorkflowActivityContext provides the name of the activity and the workflow instance.
   * @returns The return value of the activity. It can be a simple or complex type. In case an activity doesn't require an output, you can specify a nullable object since a return type is mandatory.
   *
   * Notice that you can always use the ctx.getInput() method to get the input payload.
   */

  @Override
  public Object run(WorkflowActivityContext ctx) {
    Logger logger = LoggerFactory.getLogger(Activity1.class);
    var input = ctx.getInput(String.class);
    logger.info("{} : Received input: {}", ctx.getName(), input);
    return input + " Two";
  }
}
