package com.service.controller;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import reactor.core.publisher.Mono;

import java.util.Dictionary;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.File;
import java.io.IOException;
import org.springframework.core.io.ClassPathResource;


@RestController
public class BatchProcessingServiceController {
    
    private static final Logger logger = LoggerFactory.getLogger(BatchProcessingServiceController.class);
    private static final String cronBindingPath = "/cron";
    private static final String sqlBindingName = "sqldb";
    
    @PostMapping(path = cronBindingPath, consumes = MediaType.ALL_VALUE)
    public ResponseEntity<String> processBatch() throws IOException {
        
        logger.info("Processing batch..");

        Orders ordList = this.loadOrdersFromFile("orders.json");

        for (Order order : ordList.orders) {
            String sqlText = String.format(
                "insert into orders (orderid, customer, price) " +
                "values (%s, '%s', %s);", 
                order.orderid, order.customer, order.price);
            logger.info(sqlText);

            //Map<String, String> command = new HashMap<String, String>();
            //command.put("sql", sqlText);
            String command = String.format("{\"sql\": \"%s\"}", sqlText);
            logger.info(command);
            DaprClient client = new DaprClientBuilder().build();
            client.invokeBinding(sqlBindingName, "exec", command).block();
        }

        logger.info("Finished processing batch");

        return ResponseEntity.ok("Finished processing batch");
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
