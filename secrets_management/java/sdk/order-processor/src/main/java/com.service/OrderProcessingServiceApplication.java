package com.service;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;

import java.util.Map;

public class OrderProcessingServiceApplication {
    private static final String SECRET_STORE_NAME = "localsecretstore";

    public static void main(String[] args) throws InterruptedException {
        DaprClient client = new DaprClientBuilder().build();
        Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, "secret").block();
        System.out.println("Fetched Secret: " + secret);
    }
}
