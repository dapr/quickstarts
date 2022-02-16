package com.service;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Random;
import java.util.concurrent.TimeUnit;

public class OrderProcessingServiceApplication {
    private static final Logger LOGGER = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);
    private static final String DAPR_STATE_STORE = "statestore";

    public static void main(String[] args) throws Exception {
        try (DaprClient client = new DaprClientBuilder().build()) {
            while (true) {
                Random random = new Random();
                int orderId = random.nextInt(1000 - 1) + 1;
                Order order = new Order();
                order.setOrderId(orderId);

                // Save state into the state store
                client.saveState(DAPR_STATE_STORE, String.valueOf(orderId), order).block();
                LOGGER.info("Saving Order: " + order.getOrderId());

                // Get state from the state store
                State<Order> response = client.getState(DAPR_STATE_STORE, String.valueOf(orderId), Order.class).block();
                LOGGER.info("Getting Order: " + response.getValue().getOrderId());

                // Delete state from the state store
                client.deleteState(DAPR_STATE_STORE, String.valueOf(orderId)).block();
                LOGGER.info("Deleting Order: " + orderId);
                TimeUnit.MILLISECONDS.sleep(1000);
            }
        }
    }
}

@Getter
@Setter
class Order {
    private int orderId;
}
