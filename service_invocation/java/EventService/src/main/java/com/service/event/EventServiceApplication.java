package com.service.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestTemplate;

import java.util.Random;
import java.util.concurrent.TimeUnit;

public class EventServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(EventServiceApplication.class);

	public static void main(String[] args) throws InterruptedException{
		while(true) {
			TimeUnit.MILLISECONDS.sleep(5000);
			Random random = new Random();
			int orderId = random.nextInt(1000-1) + 1;
			String uri = "http://localhost:6001/order/" + orderId;
			RestTemplate restTemplate = new RestTemplate();
			String result = restTemplate.getForObject(uri, String.class);
			log.info("Order processed for order id " + orderId);
			log.info(String.valueOf(result));
		}
	}

}
