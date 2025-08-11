package io.dapr.springboot.workflowapp.model;

public record ActivityResult(boolean isSuccess, String message) { }
