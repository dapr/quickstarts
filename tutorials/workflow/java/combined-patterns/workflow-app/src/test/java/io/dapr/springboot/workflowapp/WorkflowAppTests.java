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

package io.dapr.springboot.workflowapp;

import io.dapr.client.DaprClient;
import io.dapr.springboot.DaprAutoConfiguration;
import io.dapr.springboot.workflowapp.model.OrderStatus;
import io.dapr.springboot.workflowapp.model.Order;
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

import static io.dapr.springboot.workflowapp.StringMatchesUUIDPattern.matchesThePatternOfAUUID;
import static io.restassured.RestAssured.given;
import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(classes = {TestWorkflowAppApplication.class, DaprTestContainersConfig.class,
        DaprAutoConfiguration.class, },
        webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class WorkflowAppTests {

  @Autowired
  private DaprClient daprClient;

  @BeforeEach
  void setUp() {
    RestAssured.baseURI = "http://localhost:" + 8080;
    org.testcontainers.Testcontainers.exposeHostPorts(8080);
  }


  @Test
  void testWorkflow() throws InterruptedException {



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