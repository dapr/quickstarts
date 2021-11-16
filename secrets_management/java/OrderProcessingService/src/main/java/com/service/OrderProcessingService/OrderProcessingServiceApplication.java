package com.service.OrderProcessingService;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

@SpringBootApplication
public class OrderProcessingServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);
	private static final ObjectMapper JSON_SERIALIZER = new ObjectMapper();

	private static final String SECRET_STORE_NAME = "localsecretstore";

	public static void main(String[] args) throws InterruptedException, JsonProcessingException {
		DaprClient client = new DaprClientBuilder().build();
		Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, "secret").block();
		log.info("Result: " + JSON_SERIALIZER.writeValueAsString(secret));
		try {
			secret = client.getSecret(SECRET_STORE_NAME, "secret").block();
			log.info("Result for random key: " + JSON_SERIALIZER.writeValueAsString(secret));
		} catch (Exception ex) {
			System.out.println("Got error for accessing key");
		}
	}
}

