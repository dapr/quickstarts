package io.dapr.springboot.examples.workflowapp;

public record OrderStatus(boolean isSuccess, String message){}
