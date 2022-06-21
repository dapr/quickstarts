package com.service.controller;

import com.service.model.DaprSubscription;
import com.service.model.Order;
import com.service.model.SubscriptionData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderProcessingServiceController {
    private static final Logger logger = LoggerFactory.getLogger(OrderProcessingServiceController.class);

    /**
     * Register Dapr pub/sub subscriptions.
     *
     * @return DaprSubscription Object containing pubsub name, topic and route for subscription.
     */
    @GetMapping(path = "/dapr/subscribe", produces = MediaType.APPLICATION_JSON_VALUE)
    public DaprSubscription[] getSubscription() {
        DaprSubscription daprSubscription = DaprSubscription.builder()
                .pubSubName("orderpubsub")
                .topic("orders")
                .route("orders")
                .build();
        logger.info("Subscribed to Pubsubname {} and topic {}", "orderpubsub", "orders");
        DaprSubscription[] arr = new DaprSubscription[]{daprSubscription};
        return arr;
    }

    /**
     * Dapr subscription in /dapr/subscribe sets up this route.
     *
     * @param body Request body
     * @return ResponseEntity Returns ResponseEntity.ok()
     */
    @PostMapping(path = "/orders", consumes = MediaType.ALL_VALUE)
    public ResponseEntity<?> processOrders(@RequestBody SubscriptionData<Order> body) {
        logger.info("Subscriber received: "+ body.getData().getOrderId());
        return ResponseEntity.ok().build();
    }
}
