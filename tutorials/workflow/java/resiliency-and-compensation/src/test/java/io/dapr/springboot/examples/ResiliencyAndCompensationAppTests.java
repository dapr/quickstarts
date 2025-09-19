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

import java.time.Duration;
import java.util.concurrent.TimeUnit;

import static io.restassured.RestAssured.given;
import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = {TestResiliencyAndCompensationApplication.class, DaprTestContainersConfig.class,
        DaprAutoConfiguration.class,},
        webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class ResiliencyAndCompensationAppTests {


  @BeforeEach
  void setUp() {
    RestAssured.baseURI = "http://localhost:" + 8080;
    org.testcontainers.Testcontainers.exposeHostPorts(8080);
  }


  @Test
  void testResiliencyAndCompensation() {
    String workflowId = given().contentType(ContentType.JSON)
            .pathParam("input", 1)
            .when()
            .post("/start/{input}")
            .then()
            .statusCode(200)
            .extract().asString();

    assertNotNull(workflowId);

    await().atMost(Duration.ofSeconds(10))
            .pollDelay(500, TimeUnit.MILLISECONDS)
            .pollInterval(500, TimeUnit.MILLISECONDS)
            .until(() -> {
              String output = given().contentType(ContentType.JSON)
                      .when()
                      .get("/output")
                      .then()
                      .statusCode(200).extract().asString();

              return output.equals("1");
            });


  }

}

