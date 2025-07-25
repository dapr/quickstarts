package io.dapr.springboot.examples.workflowapp;

import java.math.BigDecimal;

public record OrderItem(String productId, String productName, int quantity, BigDecimal totalPrice) {}
