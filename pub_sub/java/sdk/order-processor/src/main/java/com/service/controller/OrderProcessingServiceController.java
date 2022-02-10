package com.service.controller;

import io.dapr.Topic;
import io.dapr.client.domain.CloudEvent;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import reactor.core.publisher.Mono;

@RestController
public class OrderProcessingServiceController {

    private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceController.class);

    @Topic(name = "orders", pubsubName = "order_pub_sub")
    @PostMapping(path = "/orders")
    public Mono<ResponseEntity> getCheckout(@RequestBody(required = false) CloudEvent<String> cloudEvent) {
        return Mono.fromSupplier(() -> {
            try {
                log.info("Subscriber received: " + cloudEvent.getData());
                return new ResponseEntity<>("successful",
                        HttpStatus.OK);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }
}