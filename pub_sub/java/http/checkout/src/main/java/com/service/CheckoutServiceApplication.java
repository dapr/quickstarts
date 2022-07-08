package com.service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

public class CheckoutServiceApplication {
	private static final Logger logger = LoggerFactory.getLogger(CheckoutServiceApplication.class);
	private static final HttpClient httpClient = HttpClient.newBuilder()
			.version(HttpClient.Version.HTTP_2)
			.connectTimeout(Duration.ofSeconds(10))
			.build();

	private static final String PUBSUB_NAME = "orderpubsub";
	private static final String TOPIC = "orders";
	private static String DAPR_HOST = System.getenv().getOrDefault("DAPR_HOST", "http://localhost");
	private static String DAPR_HTTP_PORT = System.getenv().getOrDefault("DAPR_HTTP_PORT", "3500");

	public static void main(String[] args) throws InterruptedException, IOException {
		String uri = DAPR_HOST + ":" + DAPR_HTTP_PORT + "/v1.0/publish/" + PUBSUB_NAME + "/" + TOPIC;
		for (int i = 0; i <= 10; i++) {
			int orderId = i;
			JSONObject obj = new JSONObject();
			obj.put("orderId", orderId);

			// Publish an event/message using Dapr PubSub via HTTP Post
			HttpRequest request = HttpRequest.newBuilder()
					.POST(HttpRequest.BodyPublishers.ofString(obj.toString()))
					.uri(URI.create(uri))
					.header("Content-Type", "application/json")
					.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			logger.info("Published data: {}", orderId);
			TimeUnit.MILLISECONDS.sleep(3000);
		}
	}
}
