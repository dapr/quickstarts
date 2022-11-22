package com.service;

import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.ConfigurationItem;
import io.dapr.client.domain.SubscribeConfigurationResponse;
import io.dapr.client.domain.UnsubscribeConfigurationResponse;
import reactor.core.publisher.Flux;

import java.util.List;

public class OrderProcessingServiceApplication {
    private static final String DAPR_CONFIGURATON_STORE = "configstore";
    private static List<String> CONFIGURATION_ITEMS = List.of("orderId1", "orderId2");
    private static String subscriptionId = null;

    public static void main(String[] args) throws Exception {
        // Get config items from the config store
        try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
            for (String configurationItem : CONFIGURATION_ITEMS) {
                ConfigurationItem item = client.getConfiguration(DAPR_CONFIGURATON_STORE, configurationItem).block();
                System.out.println("Configuration for " + configurationItem + ": {'value':'" + item.getValue() + "'}");
            }
        } catch (Exception e) {
            System.out.println("Could not get config item, err:" + e.getMessage());
            System.exit(1);
        }

        try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
            // Subscribe for config changes
            Flux<SubscribeConfigurationResponse> subscription = client.subscribeConfiguration(DAPR_CONFIGURATON_STORE,
                    CONFIGURATION_ITEMS.toArray(String[]::new));

            // Read config changes for 20 seconds
            subscription.subscribe((response) -> {
                // First ever response contains the subscription id
                if (response.getItems() == null || response.getItems().isEmpty()) {
                    subscriptionId = response.getSubscriptionId();
                    System.out.println("App subscribed to config changes with subscription id: " + subscriptionId);
                } else {
                    response.getItems().forEach((k, v) -> {
                        System.out.println("Configuration update for " + k + ": {'value':'" + v.getValue() + "'}");
                    });
                }
            });
            Thread.sleep(20000);
            // Unsubscribe from config changes
            UnsubscribeConfigurationResponse unsubscribe = client
                    .unsubscribeConfiguration(subscriptionId, DAPR_CONFIGURATON_STORE).block();
            if (unsubscribe.getIsUnsubscribed()) {
                System.out.println("App unsubscribed to config changes");
            } else {
                System.out.println("Error unsubscribing to config updates, err:" + unsubscribe.getMessage());
            }
        } catch (Exception e) {
            System.out.println("Error reading config updates, err:" + e.getMessage());
            System.exit(1);
        }
    }
}
