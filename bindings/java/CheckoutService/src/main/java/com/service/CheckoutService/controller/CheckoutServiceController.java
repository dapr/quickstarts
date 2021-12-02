package com.service.CheckoutService.controller;

import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/")
public class CheckoutServiceController {
    private static final Logger log = LoggerFactory.getLogger(CheckoutServiceController.class);
        @PostMapping(path = "/checkout")
        public Mono<String> getCheckout(@RequestBody(required = false) byte[] body) {
            return Mono.fromRunnable(() ->
                    log.info("Received Message: " + new String(body)));
        }
}
