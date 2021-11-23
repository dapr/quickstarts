package com.service.OrderProcessingService;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.Metadata;

import static java.util.Collections.singletonMap;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@SpringBootApplication
public class OrderProcessingServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);

	public static void main(String[] args) throws InterruptedException{
		String MESSAGE_TTL_IN_SECONDS = "1000";
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
					orderId,
					singletonMap(Metadata.TTL_IN_SECONDS, MESSAGE_TTL_IN_SECONDS)).block();
			log.info("Published data:" + orderId);
		}
	}

}
