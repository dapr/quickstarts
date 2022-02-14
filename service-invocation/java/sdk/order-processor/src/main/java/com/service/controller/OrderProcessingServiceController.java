package com.service.controller;

import com.service.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/")
public class OrderProcessingServiceController {

    private static final Logger logger = LoggerFactory.getLogger(OrderProcessingServiceController.class);

    @PostMapping(path = "/neworder", consumes = MediaType.ALL_VALUE)
    public Mono<String> handleMethod(@RequestBody(required = false) Order body) {
        return Mono.fromSupplier(() -> {
            try {
                logger.info("Checked out order id: {}", body.getOrderId());
                return "CID" + body.getOrderId();
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }
}
