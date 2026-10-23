package io.dapr.springboot.workflowapp.model;

public record OrderStatus(boolean isSuccess, String message){}
