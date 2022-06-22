package com.service.controller;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.json.JSONObject;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import java.io.File;
import java.io.IOException;
import java.security.cert.PolicyQualifierInfo;

import org.springframework.core.io.ClassPathResource;


@RestController
public class BatchProcessingServiceController {
    
    private static final Logger logger = LoggerFactory.getLogger(BatchProcessingServiceController.class);
    private static final String cronBindingPath = "/cron";
    private static final String sqlBindingName = "sqldb";

    private static String DAPR_HOST = System.getenv().getOrDefault("DAPR_HOST", "http://localhost");
	private static String DAPR_HTTP_PORT = System.getenv().getOrDefault("DAPR_HTTP_PORT", "3500");
    String daprUri = DAPR_HOST +":"+ DAPR_HTTP_PORT + "/v1.0/bindings/"+cronBindingPath;

 	private static final HttpClient httpClient = HttpClient.newBuilder()
			.version(HttpClient.Version.HTTP_2)
			.connectTimeout(Duration.ofSeconds(10))
			.build();
   
            
    @PostMapping(path = cronBindingPath, consumes = MediaType.ALL_VALUE)
    public ResponseEntity<String> processBatch() throws IOException, InterruptedException {
        
        logger.info("Processing batch..");

        Orders ordList = this.loadOrdersFromFile("orders.json");

        try {

            for (Order order : ordList.orders) {
                String sqlText = String.format(
                    "insert into orders (orderid, customer, price) " +
                    "values (%s, '%s', %s);", 
                    order.orderid, order.customer, order.price);
                logger.info(sqlText);

                //Map<String, String> command = new HashMap<String, String>();
                //command.put("sql", sqlText);
                String commandString = String.format("{\"sql\": \"%s\"}", sqlText);
                logger.info(commandString);

                JSONObject command = new JSONObject();
                command.put("sql", sqlText);
                logger.info(command.toString());

                JSONObject payload = new JSONObject();
                //`{"operation": "exec", "metadata": {"sql": "${sqlCmd}"}}`
                payload.put("metadata", command);
                payload.put("operation", "exec");
                logger.info(payload.toString());

                // Invoke sql output binding using Dapr Bindings via HTTP Post
                HttpRequest request = HttpRequest.newBuilder()
                        .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
                        .uri(URI.create(daprUri))
                        .header("Content-Type", "application/json")
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            } 

            logger.info("Finished processing batch");

            return ResponseEntity.ok("Finished processing batch");

        } catch (Exception e) {
            logger.error("HTTP client failed:", e);
            throw e;
        }

    }

    private Orders loadOrdersFromFile(String path) throws JsonProcessingException {
        // this is a mock to get things running temporarily

        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);

        String json = String.join(System.getProperty("line.separator"), 
        "{\"orders\": [",
        "{\"orderid\": 1, \"customer\": \"John Smith\", \"price\": 100.32},",
        "{\"orderid\": 2, \"customer\": \"Jane Bond\", \"price\": 15.4},",
        "{\"orderid\": 3, \"customer\": \"Tony James\", \"price\": 35.56}",
        "]",
        "}");

        Orders newOrdersBatch;

        try 
        {
            newOrdersBatch = mapper.readValue(json, Orders.class);

        } catch (Exception e) {
            logger.error(e.toString());
            newOrdersBatch = new Orders();
        }

        return newOrdersBatch;
    }
}
            
@Getter
@Setter
class Order {
public int orderid;
public String customer;
public float price;
}

@Getter
@Setter
class Orders {
public List<Order> orders;
}
