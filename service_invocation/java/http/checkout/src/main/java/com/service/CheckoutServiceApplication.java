package com.service;

import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.TimeUnit;

public class CheckoutServiceApplication {
	private static final HttpClient httpClient = HttpClient.newBuilder()
			.version(HttpClient.Version.HTTP_2)
			.connectTimeout(Duration.ofSeconds(10))
			.build();

	private static final String DAPR_HTTP_PORT = System.getenv().getOrDefault("DAPR_HTTP_PORT", "3500");

	public static void main(String[] args) throws InterruptedException, IOException {
		String dapr_url = "http://localhost:" + DAPR_HTTP_PORT + "/orders";
		for (int i=1; i<=20; i++) {
			int orderId = i;
			JSONObject obj = new JSONObject();
			obj.put("orderId", orderId);

			HttpRequest request = HttpRequest.newBuilder()
					.POST(HttpRequest.BodyPublishers.ofString(obj.toString()))
					.uri(URI.create(dapr_url))
					.header("Content-Type", "application/json")
					.header("dapr-app-id", "order-processor")
					.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			System.out.println("Order passed: "+ orderId);
			TimeUnit.MILLISECONDS.sleep(1000);
		}
	}
}
