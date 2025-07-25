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

package io.dapr.springboot.examples.workflowapp.activities;

import io.dapr.client.DaprClient;
import io.dapr.client.domain.State;
import io.dapr.springboot.examples.workflowapp.ActivityResult;
import io.dapr.springboot.examples.workflowapp.Order;
import io.dapr.springboot.examples.workflowapp.OrderItem;
import io.dapr.springboot.examples.workflowapp.ProductInventory;
import io.dapr.workflows.WorkflowActivity;
import io.dapr.workflows.WorkflowActivityContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CheckInventoryActivity implements WorkflowActivity {

  @Autowired
  private DaprClient daprClient;

  @Override
  public Object run(WorkflowActivityContext ctx) {
    Logger logger = LoggerFactory.getLogger(CheckInventoryActivity.class);
    var orderItem = ctx.getInput(OrderItem.class);
    logger.info("{} : Received input: {}", ctx.getName(), orderItem);

    var productInventory = daprClient.getState("inventory", orderItem.productId(), ProductInventory.class).block();

    if (productInventory == null)
    {
      return new ActivityResult(false, "");
    }

    var isAvailable = productInventory.getValue().quantity() >= orderItem.quantity();
    return new ActivityResult(isAvailable, "");
  }
}
