package com.service.OrderProcessingService.controller;

import com.service.OrderProcessingService.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.HttpExtension;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;


@RestController
@RequestMapping("/")
public class OrderProcessingController {

    private static final Logger log = LoggerFactory.getLogger(OrderProcessingController.class);

    @GetMapping(path="/order/{orderId}", produces = "application/json")
    public Order getProcessedOrder(@PathVariable("orderId") Integer orderId) {
        DaprClient daprClient = new DaprClientBuilder().build();
        var result = daprClient.invokeMethod(
                "checkoutservice",
                "checkout/" + orderId,
                null,
                HttpExtension.GET,
                String.class
        );
        log.info("Order requested: " + orderId);
        log.info("Result: " + result);
        return new Order("order1",  orderId);
    }
}

