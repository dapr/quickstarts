package com.service.model;

import lombok.Getter;
import lombok.Setter;

/**
 * Helps in unpacking a cloud event which Checkout application generates.
 *
 * @param <T> Type of data being passed to subscriber end point(orderProcessor app)
 */
@Getter
@Setter
public class SubscriptionData<T> {
    private T data;
}
