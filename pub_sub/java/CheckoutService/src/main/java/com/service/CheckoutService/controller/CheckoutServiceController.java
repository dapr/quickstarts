package com.service.CheckoutService.controller;

import io.dapr.Topic;
import io.dapr.client.domain.CloudEvent;

import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import reactor.core.publisher.Mono;

@RestController
public class CheckoutServiceController {

    private static final Logger log = LoggerFactory.getLogger(CheckoutServiceController.class);

    @Topic(name = "orders", pubsubName = "order_pub_sub")
    @PostMapping(path = "/checkout")
    public Mono<Void> getCheckout(@RequestBody(required = false) CloudEvent<String> cloudEvent) {
        return Mono.fromRunnable(() -> {
            try {
                log.info("Subscriber received: " + cloudEvent.getData());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }
}