package com.service;

import io.dapr.client.domain.ConversationResultAlpha2;
import io.dapr.client.domain.ConversationResultCompletionUsage;
import io.dapr.client.domain.ConversationResultCompletionUsageDetails;
import io.dapr.client.domain.ConversationResultPromptUsageDetails;

public class UsageUtils {
    static void printDetails(String componentName, ConversationResultAlpha2 result) {
        if ("echo".equals(componentName)) {
            return;
        }
        if (result.getModel() != null && !result.getModel().isEmpty()) {
            System.out.printf("Conversation model : %s\n", result.getModel());
            return;
        }

        var usage = result.getUsage();
        if (usage == null) {
            return;
        }

        printUsage(usage);
        printCompletionDetails(usage.getCompletionTokenDetails());
        printPromptDetails(usage.getPromptTokenDetails());

    }

    private static void printUsage(ConversationResultCompletionUsage usage) {
        System.out.println("Token Usage Details:");
        System.out.printf("  Completion tokens: %d\n", usage.getCompletionTokens());
        System.out.printf("  Prompt tokens: %d\n", usage.getPromptTokens());
        System.out.printf("  Total tokens: %d\n", usage.getTotalTokens());
        System.out.println();
    }

    private static void printPromptDetails(ConversationResultPromptUsageDetails completionDetails) {
        // Display completion token breakdown if available
        System.out.println("Prompt Token Details:");
        if (completionDetails.getCachedTokens() > 0) {
            System.out.printf("  Cached tokens: %d\n", completionDetails.getCachedTokens());
        }
        if (completionDetails.getAudioTokens() > 0) {
            System.out.printf("  Audio tokens: %d\n", completionDetails.getAudioTokens());
        }
        System.out.println();
    }

    private static void printCompletionDetails(ConversationResultCompletionUsageDetails completionDetails) {
        System.out.println("Completion Token Details:");
        // If audio tokens are available, display them
        if (completionDetails.getAudioTokens() > 0) {
            System.out.printf("  Audio tokens: %d\n", completionDetails.getAudioTokens());
        }

        // Display completion token breakdown if available
        if (completionDetails.getReasoningTokens() > 0) {
            System.out.printf("  Reasoning tokens: %d\n", completionDetails.getReasoningTokens());
        }

        // Display completion token breakdown if available
        if (completionDetails.getAcceptedPredictionTokens() > 0) {
            System.out.printf("  Accepted prediction tokens: %d\n", completionDetails.getAcceptedPredictionTokens());
        }

        // Display completion token breakdown if available
        if (completionDetails.getRejectedPredictionTokens() > 0) {
            System.out.printf("  Rejected prediction tokens: %d\n", completionDetails.getRejectedPredictionTokens());
        }
        System.out.println();
    }
}

