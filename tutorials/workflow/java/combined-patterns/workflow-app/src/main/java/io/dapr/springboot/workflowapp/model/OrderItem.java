package io.dapr.springboot.workflowapp.model;

import java.math.BigDecimal;

public record OrderItem(String productId, String productName, int quantity, BigDecimal totalPrice) {}
