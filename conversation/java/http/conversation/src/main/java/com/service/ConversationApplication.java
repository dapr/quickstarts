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
    private static final String CONVERSATION_COMPONENT_NAME = "ollama";
    private static final String DAPR_HOST = System.getenv().getOrDefault("DAPR_HOST", "http://localhost");
    private static final String DAPR_HTTP_PORT = System.getenv().getOrDefault("DAPR_HTTP_PORT", "3500");

    private static final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .build();

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        String baseUrl = DAPR_HOST + ":" + DAPR_HTTP_PORT;

        // Example 1: Basic conversation
        System.out.println("=== Basic Conversation Example ===");
        basicConversation(baseUrl);

        System.out.println();

        // Example 2: Conversation with tool calling
        System.out.println("=== Tool Calling Example ===");
        conversationWithToolCalling(baseUrl);
    }

    /**
     * Basic conversation example using the alpha2 API.
     */
    private static void basicConversation(String baseUrl) throws Exception {
        String conversationUrl = baseUrl + "/v1.0-alpha2/conversation/" + CONVERSATION_COMPONENT_NAME + "/converse";

        String inputBody = """
            {
                "inputs": [
                    {
                        "messages": [
                            {
                                "ofUser": {
                                    "content": [
                                        {
                                            "text": "What is dapr?"
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ],
                "parameters": {},
                "metadata": {},
                "response_format": {
                    "type": "object",
                    "properties": {"answer": {"type": "string"}},
                    "required": ["answer"]
                },
                "prompt_cache_retention": "86400s"
            }
            """;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(conversationUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(inputBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Input sent: What is dapr?");

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException("API request failed with status " + response.statusCode() + ": " + response.body());
        }

        JsonNode responseJson = objectMapper.readTree(response.body());
        JsonNode outputs = responseJson.get("outputs");
        if (outputs == null || !outputs.isArray() || outputs.size() == 0) {
            throw new RuntimeException("Response does not contain 'outputs' array. Response: " + response.body());
        }
        
        JsonNode output = outputs.get(0);
        if (output.has("model") && !output.get("model").asText().isEmpty()) {
            System.out.println("Model: " + output.get("model").asText());
        }
        if (output.has("usage")) {
            JsonNode usage = output.get("usage");
            System.out.printf("Usage: prompt_tokens=%s completion_tokens=%s total_tokens=%s%n",
                    usage.path("promptTokens").asText(),
                    usage.path("completionTokens").asText(),
                    usage.path("totalTokens").asText());
        }
        JsonNode choices = output.get("choices");
        if (choices != null && choices.isArray() && choices.size() > 0) {
            JsonNode message = choices.get(0).get("message");
            if (message != null) {
                System.out.println("Output response: " + message.get("content").asText());
            }
        }
    }

    /**
     * Conversation example with tool calling.
     * This demonstrates how to define tools and handle tool call responses.
     */
    private static void conversationWithToolCalling(String baseUrl) throws Exception {
        String conversationUrl = baseUrl + "/v1.0-alpha2/conversation/" + CONVERSATION_COMPONENT_NAME + "/converse";

        String inputBody = """
            {
                "inputs": [
                    {
                        "messages": [
                            {
                                "ofUser": {
                                    "content": [
                                        {
                                            "text": "What is the weather like in San Francisco?"
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                ],
                "parameters": {},
                "metadata": {},
                "response_format": {
                    "type": "object",
                    "properties": {"answer": {"type": "string"}},
                    "required": ["answer"]
                },
                "prompt_cache_retention": "86400s",
                "temperature": 0.7,
                "tools": [
                    {
                        "function": {
                            "name": "get_weather",
                            "description": "Get the current weather for a location",
                            "parameters": {
                                "type": "object",
                                "properties": {
                                    "location": {
                                        "type": "string",
                                        "description": "The city and state, e.g. San Francisco, CA"
                                    },
                                    "unit": {
                                        "type": "string",
                                        "enum": ["celsius", "fahrenheit"],
                                        "description": "The temperature unit to use"
                                    }
                                },
                                "required": ["location"]
                            }
                        }
                    }
                ],
                "toolChoice": "required"
            }
            """;

        HttpRequest request = HttpRequest.newBuilder()
                .uri(new URI(conversationUrl))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(inputBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Input sent: What is the weather like in San Francisco?");
        System.out.println("Tools defined: get_weather (location, unit)");

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException("API request failed with status " + response.statusCode() + ": " + response.body());
        }

        JsonNode responseJson = objectMapper.readTree(response.body());
        JsonNode outputs = responseJson.get("outputs");
        if (outputs == null || !outputs.isArray() || outputs.size() == 0) {
            throw new RuntimeException("Response does not contain 'outputs' array. Response: " + response.body());
        }
        
        JsonNode choices = outputs.get(0).get("choices");
        if (choices != null && choices.isArray() && choices.size() > 0) {
            JsonNode choice = choices.get(0);
            String finishReason = choice.has("finishReason") ? choice.get("finishReason").asText() : "";
            JsonNode message = choice.get("message");

            if ("tool_calls".equals(finishReason) && message != null && message.has("toolCalls")) {
                System.out.println("LLM requested tool calls:");
                JsonNode toolCalls = message.get("toolCalls");
                for (JsonNode toolCall : toolCalls) {
                    String toolId = toolCall.get("id").asText();
                    JsonNode function = toolCall.get("function");
                    String functionName = function.get("name").asText();
                    String arguments = function.get("arguments").asText();

                    System.out.println("  Tool ID: " + toolId);
                    System.out.println("  Function: " + functionName);
                    System.out.println("  Arguments: " + arguments);

                    String toolResult = executeWeatherTool(functionName, arguments);
                    System.out.println("  Tool Result: " + toolResult);
                }
            } else if (message != null && message.has("content")) {
                System.out.println("Output response: " + message.get("content").asText());
            }
        }
    }

    /**
     * Simulates executing a weather tool.
     * In a real application, this would call an actual weather API.
     */
    private static String executeWeatherTool(String functionName, String arguments) {
        if ("get_weather".equals(functionName)) {
            return "{\"temperature\": 65, \"unit\": \"fahrenheit\", \"description\": \"Sunny\"}";
        }
        return "{\"error\": \"Unknown function\"}";
    }
}
