package com.service;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.HttpExtension;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Random;
import java.util.concurrent.TimeUnit;

public class CheckoutServiceApplication {
    private static final Logger logger = LoggerFactory.getLogger(CheckoutServiceApplication.class);

    private static final String SERVICE_APP_ID = "orderapp";

    private static final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    private static final String DAPR_HTTP_PORT = System.getenv().getOrDefault("DAPR_HTTP_PORT", "3500");

    public static void main(String[] args) throws Exception {
        try (DaprClient client = (new DaprClientBuilder()).build()) {
            while(true) {
                TimeUnit.MILLISECONDS.sleep(3000);
                Random random = new Random();
                int orderId = random.nextInt(1000 - 1) + 1;
                Order order = new Order(orderId);
                client.invokeMethod(SERVICE_APP_ID, "neworder", order, HttpExtension.POST).block();
                logger.info("Order requested: {}", orderId);
            }
        }
    }
}

@AllArgsConstructor
@Getter
class Order {
    private int orderId;
}
