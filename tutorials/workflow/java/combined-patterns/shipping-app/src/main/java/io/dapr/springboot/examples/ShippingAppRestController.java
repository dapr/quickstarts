/*
 * Copyright 2025 The Dapr Authors
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

package io.dapr.springboot.examples;


import io.dapr.Topic;
import io.dapr.client.DaprClient;
import io.dapr.client.domain.CloudEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
public class ShippingAppRestController {

  public final static String DAPR_PUBSUB_COMPONENT = "shippingpubsub";
  public final static String DAPR_PUBSUB_REGISTRATION_TOPIC = "shipment-registration-events";
  public final static String DAPR_PUBSUB_CONFIRMED_TOPIC = "shipment-registration-confirmed-events";

  private final Logger logger = LoggerFactory.getLogger(ShippingAppRestController.class);

  @Autowired
  private DaprClient daprClient;

  /// This endpoint is called by the CheckShippingDestination activity in the WorkflowApp.
  @PostMapping("checkDestination")
  public ShippingDestinationResult checkDestination(@RequestBody Order order) {
    logger.info("checkDestination: Received input: {}", order);
    return new ShippingDestinationResult( true, "");
  }
  // This endpoint handles messages that are published to the shipment-registration-events topic.
  // The RegisterShipment activity in the WorkflowApp is publishing to this topic.
  // This method is publishing a message to the shipment-registration-confirmed-events topic.
  @PostMapping("registerShipment")
  @Topic(pubsubName = DAPR_PUBSUB_COMPONENT, name = DAPR_PUBSUB_REGISTRATION_TOPIC)
  public ShipmentRegistrationStatus registerShipment(@RequestBody CloudEvent<Order> order){
    logger.info("registerShipment: Received input: {}", order.getData());
    var status = new ShipmentRegistrationStatus(order.getData().id(), true, "");
    if( order.getData().id().isEmpty()){
      logger.info("Order Id is empty!");
    }else{
      daprClient.publishEvent(DAPR_PUBSUB_COMPONENT,
              DAPR_PUBSUB_CONFIRMED_TOPIC, status).block();
    }
    return status;
  }

  public record Order(String id, OrderItem orderItem, CustomerInfo customerInfo){}
  public record OrderItem(String productId, String productName, int quantity, BigDecimal totalPrice){}
  public record CustomerInfo(String id, String country){}
  public record ShipmentRegistrationStatus(String orderId, boolean isSuccess, String message){}
  public record ShippingDestinationResult(boolean isSuccess, String message ){}


}

