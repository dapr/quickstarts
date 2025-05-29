package com.service;

import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.ConversationInput;
import io.dapr.client.domain.ConversationRequest;
import io.dapr.client.domain.ConversationResponse;
import reactor.core.publisher.Mono;

import java.util.List;

public class Conversation {

    public static void main(String[] args) {
        String prompt = "What is Dapr?";

        try (DaprPreviewClient client = new DaprClientBuilder().buildPreviewClient()) {
            System.out.println("Input: " + prompt);

            ConversationInput daprConversationInput = new ConversationInput(prompt);

            // Component name is the name provided in the metadata block of the conversation.yaml file.
            Mono<ConversationResponse> responseMono = client.converse(new ConversationRequest("echo",
                    List.of(daprConversationInput))
                    .setContextId("contextId")
                    .setScrubPii(true).setTemperature(1.1d));
            ConversationResponse response = responseMono.block();
            System.out.printf("Output response: %s", response.getConversationOutputs().get(0).getResult());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
