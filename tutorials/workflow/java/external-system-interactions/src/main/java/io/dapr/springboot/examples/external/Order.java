package io.dapr.springboot.examples.external;

public record Order(String id, String description, int quantity, double totalPrice){}
