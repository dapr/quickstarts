/*
Copyright 2021 The Dapr Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package com.service.controller;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.json.JSONObject;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

import java.time.Duration;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import java.io.InputStream;

@RestController
public class BatchProcessingServiceController {
    
    private static final Logger logger = LoggerFactory.getLogger(BatchProcessingServiceController.class);
    private static final String cronBindingPath = "/cron";
    private static final String sqlBindingName = "sqldb";

    private static String DAPR_HOST = System.getenv().getOrDefault("DAPR_HOST", "http://localhost");
	private static String DAPR_HTTP_PORT = System.getenv().getOrDefault("DAPR_HTTP_PORT", "3500");
    String daprUri = DAPR_HOST + ":" + DAPR_HTTP_PORT + "/v1.0/bindings/" + sqlBindingName;

 	private static final HttpClient httpClient = HttpClient.newBuilder()
			.version(HttpClient.Version.HTTP_2)
			.connectTimeout(Duration.ofSeconds(10))
			.build();
   
            
    @PostMapping(path = cronBindingPath, consumes = MediaType.ALL_VALUE)
    public ResponseEntity<String> processBatch() throws Exception {
        
        logger.info("Processing batch..");

        Orders ordList = this.loadOrdersFromFile("orders.json");

        try {

            for (Order order : ordList.orders) {
                String sqlText = String.format(
                    "insert into orders (orderid, customer, price) " +
                    "values (%s, '%s', %s);", 
                    order.orderid, order.customer, order.price);
                logger.info(sqlText);

                JSONObject command = new JSONObject();
                command.put("sql", sqlText);

                JSONObject payload = new JSONObject();
                payload.put("metadata", command);
                payload.put("operation", "exec");

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

    private Orders loadOrdersFromFile(String path) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY, true);

        try (InputStream is = getClass().getClassLoader().getResourceAsStream(path)) {
            Orders obj = mapper.readValue(is, Orders.class);
            return obj;
        } catch (Exception e) {
            logger.error(e.toString());
            throw e;
        }


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
