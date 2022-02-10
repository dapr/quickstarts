package com.service;

import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Random;
import java.util.concurrent.TimeUnit;

public class CheckoutServiceApplication {
	private static final HttpClient httpClient = HttpClient.newBuilder()
			.version(HttpClient.Version.HTTP_2)
			.connectTimeout(Duration.ofSeconds(10))
			.build();

	private static final String PUBSUB_NAME = "order_pub_sub";
	private static final String TOPIC = "orders";
	private static String DAPR_HOST;
	private static String DAPR_HTTP_PORT;

	public static void main(String[] args) throws InterruptedException, IOException {
		String daprHost = System.getenv("DAPR_HOST");
		String daprHttpPort = System.getenv("DAPR_HTTP_PORT");
		DAPR_HOST = daprHost == null ? "http://localhost" : daprHost;
		DAPR_HTTP_PORT = daprHttpPort == null ? "3500" : daprHttpPort;
		publishMessages();
	}

	private static void publishMessages() throws IOException, InterruptedException {
		String uri = DAPR_HOST +":"+ DAPR_HTTP_PORT + "/v1.0/publish/"+PUBSUB_NAME+"/"+TOPIC;
		while(true) {
			TimeUnit.MILLISECONDS.sleep(3000);
			Random random = new Random();
			int orderId = random.nextInt(1000 - 1) + 1;
			JSONObject obj = new JSONObject();
			obj.put("orderId", orderId);

			HttpRequest request = HttpRequest.newBuilder()
					.POST(HttpRequest.BodyPublishers.ofString(obj.toString()))
					.uri(URI.create(uri))
					.header("Content-Type", "application/json")
					.build();

			HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
			System.out.println("Published data: "+ orderId);
		}
	}
}
