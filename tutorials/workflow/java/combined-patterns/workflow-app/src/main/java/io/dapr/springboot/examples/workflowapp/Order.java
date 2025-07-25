package io.dapr.springboot.examples.workflowapp;

public record Order(String id, OrderItem orderItem, CustomerInfo customerInfo){}
