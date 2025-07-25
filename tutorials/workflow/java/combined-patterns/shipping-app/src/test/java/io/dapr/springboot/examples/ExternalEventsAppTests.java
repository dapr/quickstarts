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
import io.dapr.springboot.examples.external.ApprovalStatus;
import io.dapr.springboot.examples.external.Order;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

import static io.dapr.springboot.examples.StringMatchesUUIDPattern.matchesThePatternOfAUUID;
import static io.restassured.RestAssured.given;
import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = {TestExternalEventsApplication.class, DaprTestContainersConfig.class,
        DaprAutoConfiguration.class, },
        webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class ExternalEventsAppTests {

  @Autowired
  private DaprClient daprClient;

  @BeforeEach
  void setUp() {
    RestAssured.baseURI = "http://localhost:" + 8080;
    org.testcontainers.Testcontainers.exposeHostPorts(8080);
  }


  @Test
  void testExternalEventsWorkflow() throws InterruptedException {

    var order = new Order("123", "Rubber ducks", 100, 500);
    given().contentType(ContentType.JSON)
            .body(order)
            .when()
            .post("/start")
            .then()
            .statusCode(200).body(matchesThePatternOfAUUID());


    String status = given().contentType(ContentType.JSON)
            .when()
            .get("/status")
            .then()
            .statusCode(200).extract().asString();

    assertTrue(status.contains("RUNNING"));

    ApprovalStatus approvalStatus = new ApprovalStatus("123", true);
    given().contentType(ContentType.JSON)
            .body(approvalStatus)
            .when()
            .post("/event")
            .then()
            .statusCode(200);

    // Wait for the workflow instance to complete

    await().atMost(Duration.ofSeconds(2))
            .pollDelay(500, TimeUnit.MILLISECONDS)
            .pollInterval(500, TimeUnit.MILLISECONDS)
            .until(() -> {
               var completedStatus = given().contentType(ContentType.JSON)
                      .when()
                      .get("/status")
                      .then()
                      .statusCode(200).extract().asString();
              assertTrue(completedStatus.contains("COMPLETED"));
              assertTrue(completedStatus.contains("has been approved"));
              return true;
            });

  }

}


class StringMatchesUUIDPattern extends TypeSafeMatcher<String> {
  private static final String UUID_REGEX = "[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}";

  @Override
  protected boolean matchesSafely(String s) {
    return s.matches(UUID_REGEX);
  }

  @Override
  public void describeTo(Description description) {
    description.appendText("a string matching the pattern of a UUID");
  }

  public static Matcher<String> matchesThePatternOfAUUID() {
    return new StringMatchesUUIDPattern();
  }

}