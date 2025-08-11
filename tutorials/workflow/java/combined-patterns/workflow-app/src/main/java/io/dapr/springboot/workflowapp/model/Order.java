package io.dapr.springboot.workflowapp.model;

public record Order(String id, OrderItem orderItem, CustomerInfo customerInfo){}
