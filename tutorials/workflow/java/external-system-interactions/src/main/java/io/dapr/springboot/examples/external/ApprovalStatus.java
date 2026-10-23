package io.dapr.springboot.examples.external;

public record ApprovalStatus(String orderId, boolean isApproved){}
