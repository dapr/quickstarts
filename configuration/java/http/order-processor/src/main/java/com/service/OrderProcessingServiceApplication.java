package com.service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.json.*;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Collections;
import java.util.List;

@SpringBootApplication
public class OrderProcessingServiceApplication {
    private static final String DAPR_CONFIGURATION_STORE = "configstore";
    private static List<String> CONFIGURATION_ITEMS = List.of("orderId1",
            "orderId2");
    private static String DAPR_HOST = System.getenv().getOrDefault("DAPR_HOST",
            "http://localhost");
    private static String DAPR_HTTP_PORT = System.getenv().getOrDefault("DAPR_HTTP_PORT", "3500");
    private static String APP_PORT = System.getenv().getOrDefault("APP_PORT", "6001");
    private static final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public static void main(String[] args) throws IOException, URISyntaxException, InterruptedException {
        URI baseUrl = new URI(DAPR_HOST + ":" + DAPR_HTTP_PORT);
        // Get config items from the config store
        try {
            for (String configurationItem : CONFIGURATION_ITEMS) {
                URI uri = baseUrl
                        .resolve(
                                "/v1.0-alpha1/configuration/" + DAPR_CONFIGURATION_STORE + "?key=" +
                                        configurationItem);
                HttpRequest request = HttpRequest.newBuilder()
                        .GET()
                        .uri(uri)
                        .build();
                HttpResponse<String> response = httpClient.send(request,
                        HttpResponse.BodyHandlers.ofString());
                System.out.println("Configuration for " + configurationItem + ":" +
                        response.body());
            }
        } catch (Exception e) {
            System.out.println("Could not get config item, err:" + e.getMessage());
            System.exit(1);
        }

        // Create Spring Application to listen to configuration updates
        SpringApplication app = new SpringApplication(OrderProcessingServiceApplication.class);
        app.setDefaultProperties(Collections.singletonMap("server.port", APP_PORT));

        // Start the application
        ConfigurableApplicationContext context = app.run(args);

        // Add delay to allow app channel to be ready
        Thread.sleep(3000);

        // Subscribe to Configuration Updates
        String subscriptionId = null;
        try {
            URI uri = baseUrl
                    .resolve("/v1.0-alpha1/configuration/" + DAPR_CONFIGURATION_STORE + "/subscribe");
            HttpRequest request = HttpRequest.newBuilder()
                    .GET()
                    .uri(uri)
                    .build();
            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());
            JSONObject subscription = new JSONObject(response.body());
            subscriptionId = subscription.getString("id");
            System.out.println("App subscribed to config changes with subscription id:" + subscriptionId);
        } catch (Exception e) {
            System.out.println("Error subscribing to config updates, err:" + e.getMessage());
            System.exit(1);
        }

        // Receive config updates for 20 seconds, then unsubscribe from config updates and shutdown spring app
        Thread.sleep(20000);
        try {
            // unsubscribe from config updates
            URI uri = baseUrl
                    .resolve("/v1.0-alpha1/configuration/" + DAPR_CONFIGURATION_STORE + "/" + subscriptionId
                            + "/unsubscribe");
            HttpRequest request = HttpRequest.newBuilder()
                    .GET()
                    .uri(uri)
                    .build();
            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());
            if (response.body().contains("true")) {

                System.out.println("App unsubscribed from config changes");
            } else {

                System.out.println("Error unsubscribing from config updates: " + response.body());
            }
        } catch (Exception e) {
            System.out.println("Error unsubscribing from config updates, err:" + e.getMessage());
            System.exit(1);
        }

        // Shutdown spring app
        System.out.println("Shutting down spring app");
        SpringApplication.exit(context, () -> 0);
        System.exit(0);
    }
}
