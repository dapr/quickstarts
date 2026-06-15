/*
 * Copyright 2026 The Dapr Authors
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.dapr.springboot.examples;

import io.dapr.springboot.DaprAutoConfiguration;
import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.awaitility.Awaitility;
import org.hamcrest.Description;
import org.hamcrest.Matcher;
import org.hamcrest.TypeSafeMatcher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Duration;

import static io.dapr.springboot.examples.HistoryPropagationAppTests.StringMatchesUUIDPattern.matchesThePatternOfAUUID;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;

@SpringBootTest(classes = {TestHistoryPropagationApplication.class, DaprTestContainersConfig.class,
        DaprAutoConfiguration.class, },
        webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
class HistoryPropagationAppTests {

  @BeforeEach
  void setUp() {
    RestAssured.baseURI = "http://localhost:" + 8080;
    org.testcontainers.Testcontainers.exposeHostPorts(8080);
  }

  @Test
  void testHistoryPropagation() {
    given().contentType(ContentType.JSON)
            .body("{\"patientId\":\"P-1042\",\"name\":\"Jane Doe\","
                    + "\"condition\":\"bacterial sinusitis\","
                    + "\"medication\":\"amoxicillin\",\"dosage\":500}")
            .when()
            .post("/start")
            .then()
            .statusCode(200)
            .body(matchesThePatternOfAUUID());

    // Workflow completes asynchronously; poll /output until dispensed=true.
    Awaitility.await()
            .atMost(Duration.ofSeconds(60))
            .pollInterval(Duration.ofSeconds(2))
            .untilAsserted(() -> given().contentType(ContentType.JSON)
                    .when()
                    .get("/output")
                    .then()
                    .statusCode(200)
                    .body(containsString("\"dispensed\":true")));
  }

  static class StringMatchesUUIDPattern extends TypeSafeMatcher<String> {
    private static final String UUID_REGEX =
            "[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}";

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
}
