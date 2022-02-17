package com.service;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Random;
import java.util.concurrent.TimeUnit;

public class CheckoutServiceApplication {
	private static final Logger logger = LoggerFactory.getLogger(CheckoutServiceApplication.class);

	public static void main(String[] args) throws InterruptedException{
		String TOPIC_NAME = "orders";
		String PUBSUB_NAME = "order_pub_sub";

		while(true) {
			Random random = new Random();
			int orderId = random.nextInt(1000-1) + 1;
			Order order = new Order(orderId);
			DaprClient client = new DaprClientBuilder().build();

			// Publish an event/message using Dapr PubSub
			client.publishEvent(
					PUBSUB_NAME,
					TOPIC_NAME,
					order).block();
			logger.info("Published data: " + order.getOrderId());
			TimeUnit.MILLISECONDS.sleep(5000);
		}
	}
}

@AllArgsConstructor
@Getter
class Order {
	private int orderId;
}
