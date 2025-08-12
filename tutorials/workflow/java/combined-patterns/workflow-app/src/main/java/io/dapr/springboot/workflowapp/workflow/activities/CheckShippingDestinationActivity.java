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

package io.dapr.springboot.workflowapp.workflow.activities;

import io.dapr.springboot.workflowapp.model.ActivityResult;
import io.dapr.springboot.workflowapp.model.Order;
import io.dapr.workflows.WorkflowActivity;
import io.dapr.workflows.WorkflowActivityContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/*

 */
@Component
public class CheckShippingDestinationActivity implements WorkflowActivity {

  /*

   */

  @Autowired
  private RestTemplate restTemplate;

  @Override
  public Object run(WorkflowActivityContext ctx) {
    Logger logger = LoggerFactory.getLogger(CheckShippingDestinationActivity.class);
    var order = ctx.getInput(Order.class);
    logger.info("{} : Checking Shipping Destination for Order: {}", ctx.getName(), order.id());
    HttpEntity<Order> orderHttpEntity = new HttpEntity<>(order);
    String url = "http://localhost:8081/checkDestination"; // <- Shipping app URL
    ResponseEntity<ShippingDestinationResult> httpPost = restTemplate.exchange(url, HttpMethod.POST,
            orderHttpEntity, ShippingDestinationResult.class);

    if(!httpPost.getStatusCode().is2xxSuccessful()){
      logger.info("{} : Failed to register shipment. Reason:: {}", ctx.getName(), httpPost.getStatusCode().value());
      throw new RuntimeException("Failed to register shipment. Reason: " + httpPost.getStatusCode().value());
    }
    ShippingDestinationResult result = httpPost.getBody();
    assert result != null;
    return new ActivityResult(result.isSuccess(), "");
  }

  record ShippingDestinationResult(boolean isSuccess){}
}
