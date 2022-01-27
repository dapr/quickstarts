package com.service.OrderProcessingService.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/")
public class OrderProcessingServiceController {

    private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceController.class);

    @GetMapping(path="/order", produces = "application/json")
    public void getOrder() {
        Random random = new Random();
        int orderId = random.nextInt(1000-1) + 1;
        String daprPort = "3602";
        String daprUrl = "http://localhost:" + daprPort + "/v1.0/invoke/checkout/method/checkout/" + orderId;
        RestTemplate restTemplate = new RestTemplate();
        String result = restTemplate.getForObject(daprUrl, String.class);
        log.info("Order requested: " + orderId);
        log.info("Result: " + result);
    }
}
