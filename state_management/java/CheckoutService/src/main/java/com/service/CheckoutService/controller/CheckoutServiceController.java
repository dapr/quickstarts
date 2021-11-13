package com.service.CheckoutService.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/")
public class CheckoutServiceController {

    private static final Logger log = LoggerFactory.getLogger(CheckoutServiceController.class);

    @GetMapping(path="/checkout/{orderId}", produces = "application/json")
    public String getCheckout(@PathVariable("orderId") String orderId) {
        log.info("Checked out order id : " + orderId);
        return "CID" + orderId;
    }
}
