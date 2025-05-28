package com.service;

import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.ConversationInput;
import io.dapr.client.domain.ConversationRequest;
import io.dapr.client.domain.ConversationResponse;
import reactor.core.publisher.Mono;

import java.util.List;

public class ConversationAIApplication {

    public static void main(String[] args) {
        try (DaprPreviewClient client = new DaprClientBuilder().buildPreviewClient()) {
            System.out.println("Sending the following input to LLM: Hello How are you? This is the my number 672-123-4567");

            ConversationInput daprConversationInput = new ConversationInput("Hello How are you? "
                    + "This is the my number 672-123-4567");

            // Component name is the name provided in the metadata block of the conversation.yaml file.
            Mono<ConversationResponse> responseMono = client.converse(new ConversationRequest("echo",
                    List.of(daprConversationInput))
                    .setContextId("contextId")
                    .setScrubPii(true).setTemperature(1.1d));
            ConversationResponse response = responseMono.block();
            System.out.printf("Conversation output: %s", response.getConversationOutputs().get(0).getResult());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
