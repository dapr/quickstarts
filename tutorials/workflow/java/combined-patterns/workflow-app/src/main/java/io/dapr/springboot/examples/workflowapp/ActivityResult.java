package io.dapr.springboot.examples.workflowapp;

public record ActivityResult(boolean isSuccess, String message) { }
