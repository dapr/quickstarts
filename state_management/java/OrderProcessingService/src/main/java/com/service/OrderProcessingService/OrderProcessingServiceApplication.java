package com.service.OrderProcessingService;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import io.dapr.client.domain.TransactionalStateOperation;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@SpringBootApplication
public class OrderProcessingServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);

	private static final String STATE_STORE_NAME = "statestore";

	public static void main(String[] args) throws InterruptedException{
		while(true) {
			TimeUnit.MILLISECONDS.sleep(5000);
			Random random = new Random();
			int orderId = random.nextInt(1000-1) + 1;
			DaprClient client = new DaprClientBuilder().build();
			client.saveState(STATE_STORE_NAME, "order_1", Integer.toString(orderId)).block();
			client.saveState(STATE_STORE_NAME, "order_2", Integer.toString(orderId)).block();
			Mono<State<String>> result = client.getState(STATE_STORE_NAME, "order_1", String.class);
			log.info("Result after get" + result);

			Mono<List<State<String>>> resultBulk = client.getBulkState(STATE_STORE_NAME,
					Arrays.asList("order_1", "order_2"), String.class);

			log.info("Result after get bulk" + resultBulk);

			List<TransactionalStateOperation<?>> operationList = new ArrayList<>();
			operationList.add(new TransactionalStateOperation<>(TransactionalStateOperation.OperationType.UPSERT,
					new State<>("order_3", Integer.toString(orderId), "")));
			operationList.add(new TransactionalStateOperation<>(TransactionalStateOperation.OperationType.DELETE,
					new State<>("order_2")));
			client.executeStateTransaction(STATE_STORE_NAME, operationList).block();

			String storedEtag = client.getState(STATE_STORE_NAME, "order_1", String.class).block().getEtag();
			client.deleteState(STATE_STORE_NAME, "order_1", storedEtag, null).block();

			log.info("Order requested: " + orderId);
			log.info("Result: " + result);
		}
	}

}
