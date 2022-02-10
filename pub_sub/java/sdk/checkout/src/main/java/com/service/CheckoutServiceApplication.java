package com.service;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.Metadata;

import static java.util.Collections.singletonMap;
import java.util.Random;
import java.util.concurrent.TimeUnit;

public class CheckoutServiceApplication {
	public static void main(String[] args) throws InterruptedException{
		String TOPIC_NAME = "orders";
		String PUBSUB_NAME = "order_pub_sub";

		while(true) {
			TimeUnit.MILLISECONDS.sleep(5000);
			Random random = new Random();
			int orderId = random.nextInt(1000-1) + 1;
			DaprClient client = new DaprClientBuilder().build();
			client.publishEvent(
					PUBSUB_NAME,
					TOPIC_NAME,
					orderId).block();
			System.out.println("Published data: " + orderId);
		}
	}
}
