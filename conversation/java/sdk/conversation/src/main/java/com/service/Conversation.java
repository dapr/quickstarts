package com.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.ConversationInputAlpha2;
import io.dapr.client.domain.ConversationMessageContent;
import io.dapr.client.domain.ConversationRequestAlpha2;
import io.dapr.client.domain.ConversationResponseAlpha2;
import io.dapr.client.domain.ConversationResultAlpha2;
import io.dapr.client.domain.ConversationResultChoices;
import io.dapr.client.domain.ConversationResultMessage;
import io.dapr.client.domain.ConversationToolCalls;
import io.dapr.client.domain.ConversationTools;
import io.dapr.client.domain.ConversationToolsFunction;
import io.dapr.client.domain.UserMessage;

public class Conversation {

    private static final String CONVERSATION_COMPONENT_NAME = "echo";
    private static final String CONVERSATION_TEXT = "What is dapr?";
    private static final String TOOL_CALL_INPUT = "What is the weather like in San Francisco in celsius?";

    public static void main(String[] args) {
        try (DaprPreviewClient client = new DaprClientBuilder().buildPreviewClient()) {

            // Define tool function parameters schema
            Map<String, Object> locationProperty = new HashMap<>();
            locationProperty.put("type", "string");
            locationProperty.put("description", "The city and state, e.g. San Francisco, CA");

            Map<String, Object> unitProperty = new HashMap<>();
            unitProperty.put("type", "string");
            unitProperty.put("enum", List.of("celsius", "fahrenheit"));
            unitProperty.put("description", "The temperature unit to use");

            Map<String, Object> properties = new HashMap<>();
            properties.put("location", locationProperty);
            properties.put("unit", unitProperty);

            Map<String, Object> parameters = new HashMap<>();
            parameters.put("type", "object");
            parameters.put("properties", properties);
            parameters.put("required", List.of("location"));

            // Create the tool function
            ConversationToolsFunction getWeatherFunction = new ConversationToolsFunction("get_weather", parameters)
                    .setDescription("Get the current weather for a location");
            ConversationTools weatherTool = new ConversationTools(getWeatherFunction);

            // ==========================================
            // Simple Conversation
            // ==========================================
            System.out.println("=== Simple Conversation ===");

            UserMessage conversationMessage = new UserMessage(
                    List.of(new ConversationMessageContent(CONVERSATION_TEXT)))
                    .setName("TestUser");
            ConversationInputAlpha2 conversationInput = new ConversationInputAlpha2(List.of(conversationMessage));

            ConversationResponseAlpha2 conversationResponse = client.converseAlpha2(
                    new ConversationRequestAlpha2(CONVERSATION_COMPONENT_NAME, List.of(conversationInput))
                            .setScrubPii(false)
                            .setToolChoice("auto")
                            .setTemperature(0.7)
                            .setTools(List.of(weatherTool))).block();

            System.out.println("Conversation input sent: " + CONVERSATION_TEXT);
            String outputContent = conversationResponse.getOutputs().get(0)
                    .getChoices().get(0).getMessage().getContent();
            System.out.println("Output response: " + outputContent);

            // ==========================================
            // Tool Calling
            // ==========================================
            System.out.println("\n=== Tool Calling ===");

            UserMessage toolCallMessage = new UserMessage(
                    List.of(new ConversationMessageContent(TOOL_CALL_INPUT)))
                    .setName("TestUser");
            ConversationInputAlpha2 toolCallInput = new ConversationInputAlpha2(List.of(toolCallMessage));

            ConversationResponseAlpha2 toolCallResponse = client.converseAlpha2(
                    new ConversationRequestAlpha2(CONVERSATION_COMPONENT_NAME, List.of(toolCallInput))
                            .setScrubPii(false)
                            .setToolChoice("auto")
                            .setTemperature(0.7)
                            .setTools(List.of(weatherTool))).block();

            System.out.println("Tool calling input sent: " + TOOL_CALL_INPUT);

            ConversationResultAlpha2 result = toolCallResponse.getOutputs().get(0);
            ConversationResultChoices choice = result.getChoices().get(0);
            ConversationResultMessage message = choice.getMessage();

            System.out.println("Output message: " + message.getContent());

            if (message.hasToolCalls()) {
                System.out.println("Tool calls detected:");
                for (ConversationToolCalls toolCall : message.getToolCalls()) {
                    String functionName = toolCall.getFunction().getName();
                    String functionArguments = toolCall.getFunction().getArguments();

                    System.out.println("Tool call: {\"id\": \"" + toolCall.getId()
                            + "\", \"function\": {\"name\": \"" + functionName
                            + "\", \"arguments\": " + functionArguments + "}}");
                    System.out.println("Function name: " + functionName);
                    System.out.println("Function arguments: " + functionArguments);
                }
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
