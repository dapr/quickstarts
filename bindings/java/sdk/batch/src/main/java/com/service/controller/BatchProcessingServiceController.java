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

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.exceptions.DaprException;
import io.dapr.exceptions.DaprErrorDetails;
import io.dapr.utils.TypeRef;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.InputStream;
import reactor.core.publisher.Mono;
import java.nio.charset.StandardCharsets;


@RestController
public class BatchProcessingServiceController {
    
    private static final Logger logger = LoggerFactory.getLogger(BatchProcessingServiceController.class);
    private static final String cronBindingPath = "/cron";
    private static final String sqlBindingName = "sqldb";
    
    @PostMapping(path = cronBindingPath, consumes = MediaType.ALL_VALUE)
    public void processBatch() throws Exception {
        
        logger.info("Processing batch..");

        //Orders ordList = this.loadOrdersFromFile("orders.json");

        try (DaprClient client = new DaprClientBuilder().build()) {

            // for (Order order : ordList.orders) {
            //     String sqlText = String.format(
            //         "insert into orders (orderid, customer, price) " +
            //         "values (%s, '%s', %s);", 
            //         order.orderid, order.customer, order.price);
            //     logger.info(sqlText);
    
            //     Map<String, String> metadata = new HashMap<String, String>();
            //     metadata.put("sql", sqlText);
 
            //     // Invoke sql output binding using Dapr SDK
            //     client.invokeBinding(sqlBindingName, "exec", null, metadata).block();
            // } 

            // HttpBindingResponse response = new HttpBindingResponse();
            // //Mono<HttpBindingResponse> responseMono = client.invokeBinding("http", "get", null, HttpBindingResponse.class).block();
            // //HttpBindingResponse response = responseMono.block(); 
            // response = client.invokeBinding("http", "get", null, HttpBindingResponse.class).block();

            // Raw request body
            String rawBody = "Hello from Dapr using raw bytes!";
            byte[] requestData = rawBody.getBytes(StandardCharsets.UTF_8);

            // Invoke the binding with byte[] input, expecting byte[] in response
            Mono<HttpBindingResponse> responseMono = client.invokeBinding(
                    "http",             // binding name
                    "post",                      // operation
                    requestData,                 // raw bytes in
                    HttpBindingResponse.class    // response class with byte[] data
            );

            HttpBindingResponse response = responseMono.block();
            
            
            // Decode base64-encoded data string to byte[]
            byte[] decodedBytes = response.getDecodedData();
            String decodedText = new String(decodedBytes, StandardCharsets.UTF_8);

            System.out.println("Decoded Response Body: " + decodedText);
            System.out.println("Metadata: " + response.getMetadata());

        } catch (DaprException exception) {
            System.out.println("Dapr exception's error code: (DaprException.getErrorCode()): " + exception.getErrorCode());
            System.out.println("Dapr exception's message: (DaprError.getMessage()) " + exception.getMessage());
            System.out.println("Dapr exception's error details (DaprException.getErrorDetails())): " + exception.getErrorDetails().get(
                DaprErrorDetails.ErrorDetailType.ERROR_INFO,
                "reason",
                TypeRef.STRING));
            System.out.println("Dapr exception's getHttpStatusCode: (DaprException.getHttpStatusCode()): " + exception.getHttpStatusCode());
            System.out.println("Error's payload: (DaprException.getPayload()): " + exception.getPayload());
            if (exception.getPayload() != null){
                System.out.println("Error's payload size: (DaprException.getPayload().length): " + exception.getPayload().length);
            }
          }

    }
}

