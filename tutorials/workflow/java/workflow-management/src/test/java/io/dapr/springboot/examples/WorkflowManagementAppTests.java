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

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = {TestWorkflowManagementApplication.class, DaprTestContainersConfig.class,
        DaprAutoConfiguration.class, },
        webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class WorkflowManagementAppTests {

  @Autowired
  private DaprClient daprClient;

  @BeforeEach
  void setUp() {
    RestAssured.baseURI = "http://localhost:" + 8080;
    org.testcontainers.Testcontainers.exposeHostPorts(8080);
  }


  @Test
  void testWorkflowManagement() {
    String workflowId = given().contentType(ContentType.JSON)
            .pathParam("counter", 0)
            .when()
            .post("/start/{counter}")
            .then()
            .statusCode(200)
            .extract().asString();

    assertNotNull(workflowId);


    String status = given().contentType(ContentType.JSON)
            .pathParam("instanceId", workflowId)
            .when()
            .get("/status/{instanceId}")
            .then()
            .statusCode(200).extract().asString();

    assertTrue(status.contains("RUNNING"));


    given().contentType(ContentType.JSON)
            .pathParam("instanceId", workflowId)
            .when()
            .post("/suspend/{instanceId}")
            .then()
            .statusCode(200);


    status = given().contentType(ContentType.JSON)
            .pathParam("instanceId", workflowId)
            .when()
            .get("/status/{instanceId}")
            .then()
            .statusCode(200).extract().asString();

    assertTrue(status.contains("SUSPENDED"));

    given().contentType(ContentType.JSON)
            .pathParam("instanceId", workflowId)
            .when()
            .post("/resume/{instanceId}")
            .then()
            .statusCode(200);


    status = given().contentType(ContentType.JSON)
            .pathParam("instanceId", workflowId)
            .when()
            .get("/status/{instanceId}")
            .then()
            .statusCode(200).extract().asString();

    assertTrue(status.contains("RUNNING"));


    given().contentType(ContentType.JSON)
            .pathParam("instanceId", workflowId)
            .when()
            .post("/terminate/{instanceId}")
            .then()
            .statusCode(200);

    status = given().contentType(ContentType.JSON)
            .pathParam("instanceId", workflowId)
            .when()
            .get("/status/{instanceId}")
            .then()
            .statusCode(200).extract().asString();

    assertTrue(status.contains("TERMINATED"));


  }

}

