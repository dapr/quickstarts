package io.dapr.springboot.examples.workflowapp;

public record ShipmentRegistrationStatus(String orderId, boolean isSuccess, String message) { }

