/*
 * Copyright 2024 The Dapr Authors
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

package com.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class ConversationApplication {
    private static final String CONVERSATION_COMPONENT_NAME = "echo";
    private static final String DAPR_HOST = System.getenv().getOrDefault("DAPR_HOST", "http://localhost");
    private static final String DAPR_HTTP_PORT = System.getenv().getOrDefault("DAPR_HTTP_PORT", "3500");
    
    private static final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public static void main(String[] args) throws Exception {
        String baseUrl = DAPR_HOST + ":" + DAPR_HTTP_PORT;
        String conversationUrl = baseUrl + "/v1.0-alpha1/conversation/" + CONVERSATION_COMPONENT_NAME + "/converse";

        // Create the input request body
        String inputBody = """
            {
                "inputs": [{"content": "What is dapr?"}],
                "parameters": {},
                "metadata": {}
            }
            """;

        // Build the HTTP POST request
        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(conversationUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(inputBody))
                .build();

        // Send the request to the Dapr conversation API
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Input sent: What is dapr?");

        // Parse the response
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode responseJson = objectMapper.readTree(response.body());
        
        // Extract the result from outputs array
        String result = responseJson.get("outputs").get(0).get("result").asText();
        
        System.out.println("Output response: " + result);
    }
}
