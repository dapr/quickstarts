package io.dapr.springboot.workflowapp.model;

public record ShipmentRegistrationStatus(String orderId, boolean isSuccess, String message) { }

