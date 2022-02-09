package com.service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.core.env.Environment;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@SpringBootApplication
public class CheckoutServiceApplication implements CommandLineRunner {
	private static final Logger logger = LoggerFactory.getLogger(CheckoutServiceApplication.class);
	private static final HttpClient httpClient = HttpClient.newBuilder()
			.version(HttpClient.Version.HTTP_2)
			.connectTimeout(Duration.ofSeconds(10))
			.build();

	private static final String PUBSUB_NAME = "order_pub_sub";
	private static final String TOPIC = "orders";
	private static String dapr_host;
	private static String dapr_http_port;

	@Autowired
	private Environment environment;

	public static void main(String[] args) throws InterruptedException, IOException {
		SpringApplication.run(CheckoutServiceApplication.class, args);
		publishMessages();
	}

	private static void publishMessages() throws IOException, InterruptedException {
		String uri = dapr_host+":"+dapr_http_port + "/v1.0/publish/"+PUBSUB_NAME+"/"+TOPIC;
		logger.info("Publishing to url : "+ uri);
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
	@Override
	public void run(String... args) {
		String daprHost = environment.getProperty("DAPR_HOST");
		String daprHttpPort = environment.getProperty("DAPR_HTTP_PORT");
		dapr_host = daprHost == null ? "http://localhost" : daprHost;
		dapr_http_port = daprHttpPort == null ? "3500" : daprHttpPort;
	}
}
