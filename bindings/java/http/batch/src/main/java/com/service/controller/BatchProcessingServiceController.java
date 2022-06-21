package com.service.controller;

import lombok.Getter;
import lombok.Setter;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import reactor.core.publisher.Mono;

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

        //File resource = new ClassPathResource("orders.json").getFile();
        //logger.info(resource.getAbsolutePath());
        //File resource = new ClassPathResource("../../../orders.json").getFile();
        //File file = ResourceUtils.getFile("classpath:orders.json");

        // return Mono.fromSupplier(() -> {
            //     try {
                //         logger.info("Subscriber received: " + cloudEvent.getData().getOrderId());
                //         return ResponseEntity.ok("SUCCESS");
                //     } catch (Exception e) {
                    //         throw new RuntimeException(e);
                    //     }
                    // });
        logger.info("Finished processing batch");

        return ResponseEntity.ok("Finished processing batch");
    }
}
            
@Getter
@Setter
class Order {
    private int orderid;
    private String customer;
    private float price;
}

@Getter
@Setter
class Orders {
    private Order[] orders;
}
