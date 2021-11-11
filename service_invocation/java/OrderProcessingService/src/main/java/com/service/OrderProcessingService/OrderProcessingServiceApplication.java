package com.service.OrderProcessingService;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.HttpExtension;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@SpringBootApplication
public class OrderProcessingServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);

	public static void main(String[] args) throws InterruptedException{
		while(true) {
			TimeUnit.MILLISECONDS.sleep(5000);
			Random random = new Random();
			int orderId = random.nextInt(1000-1) + 1;
			DaprClient daprClient = new DaprClientBuilder().build();
			var result = daprClient.invokeMethod(
					"checkoutservice",
					"checkout/" + orderId,
					null,
					HttpExtension.GET,
					String.class
			);
			log.info("Order requested: " + orderId);
			log.info("Result: " + result);
		}
	}

}
