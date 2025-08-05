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

import io.dapr.client.DaprClient;
import io.dapr.springboot.DaprAutoConfiguration;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;

import static io.restassured.RestAssured.given;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = {TestShippingApplication.class, DaprTestContainersConfig.class,
        DaprAutoConfiguration.class, },
        webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class ShippingAppTests {

  @Autowired
  private DaprClient daprClient;

  @BeforeEach
  void setUp() {
    RestAssured.baseURI = "http://localhost:" + 8080;
    org.testcontainers.Testcontainers.exposeHostPorts(8080);
  }


  @Test
  void testCheckDestinationEndpoint() throws InterruptedException {
    ShippingAppRestController.OrderItem orderItem = new ShippingAppRestController.OrderItem("ABC-123", "The Mars Volta EP", 1, BigDecimal.valueOf(100));
    ShippingAppRestController.CustomerInfo customerInfo = new ShippingAppRestController.CustomerInfo("CUST-456", "UK");
    var order = new ShippingAppRestController.Order("123", orderItem, customerInfo);
    ShippingAppRestController.ShippingDestinationResult result = given().contentType(ContentType.JSON)
            .body(order)
            .when()
            .post("/checkDestination")
            .then()
            .statusCode(200).extract()
            .as(ShippingAppRestController.ShippingDestinationResult.class);

    assertTrue(result.isSuccess());


  }

  @Test
  void testCheckRegisterShipmentEndpoint() throws InterruptedException {
    ShippingAppRestController.OrderItem orderItem = new ShippingAppRestController.OrderItem("ABC-123", "The Mars Volta EP", 1, BigDecimal.valueOf(100));
    ShippingAppRestController.CustomerInfo customerInfo = new ShippingAppRestController.CustomerInfo("CUST-456", "UK");
    var order = new ShippingAppRestController.Order("123", orderItem, customerInfo);
    ShippingAppRestController.ShipmentRegistrationStatus status = given().contentType(ContentType.JSON)
            .body(order)
            .when()
            .post("/registerShipment")
            .then()
            .statusCode(200).extract()
            .as(ShippingAppRestController.ShipmentRegistrationStatus.class);

    assertTrue(status.isSuccess());


  }

}


