package com.service.OrderProcessingService.model;

public class Order {
    String orderName;
    Integer orderNum;

    public Order(String orderName, Integer orderNum) {
        this.orderName = orderName;
        this.orderNum = orderNum;
    }

    public String getOrderName() {
        return orderName;
    }

    public void setOrderName(String orderName) {
        this.orderName = orderName;
    }

    public Integer getOrderNum() {
        return orderNum;
    }

    public void setOrderNum(Integer orderNum) {
        this.orderNum = orderNum;
    }

    @Override
    public String toString() {
        return "Order{" +
                "orderName='" + orderName + '\'' +
                ", orderNum='" + orderNum + '\'' +
                '}';
    }
}
