package com.service;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import lombok.Getter;
import lombok.Setter;
import java.util.concurrent.TimeUnit;

public class OrderProcessingServiceApplication {
    private static final String DAPR_STATE_STORE = "statestore";

    public static void main(String[] args) throws Exception {
        try (DaprClient client = new DaprClientBuilder().build()) {
            for (int i = 1; i <= 100; i++) {
                int orderId = i;
                Order order = new Order();
                order.setOrderId(orderId);

                // Save state into the state store
                client.saveState(DAPR_STATE_STORE, String.valueOf(orderId), order).block();
                System.out.println("Saving Order: " + order.getOrderId());

                // Get state from the state store
                State<Order> response = client.getState(DAPR_STATE_STORE, String.valueOf(orderId), Order.class).block();
                System.out.println("Getting Order: " + response.getValue().getOrderId());

                // Delete state from the state store
                client.deleteState(DAPR_STATE_STORE, String.valueOf(orderId)).block();
                System.out.println("Deleting Order: " + orderId);
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
