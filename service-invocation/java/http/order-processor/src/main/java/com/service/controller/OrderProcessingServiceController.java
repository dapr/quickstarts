package com.service.controller;

import com.service.model.Order;
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

    @PostMapping(path = "/neworder", consumes = MediaType.ALL_VALUE)
    public String processOrders(@RequestBody Order body) {
        logger.info("Checked out order id: {}", body.getOrderId());
        return "CID" + body.getOrderId();
    }
}
