package com.service.controller;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OrderProcessingServiceController {
    /**
     * Read configuration updates from config store
     *
     * @param body Request body
     * @return ResponseEntity Returns ResponseEntity.ok()
     */
    @PostMapping(path = "/configuration/configstore/{configItem}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> readUpdates(@RequestBody Map<String, Object> body) {
        System.out.println("Configuration update "+ body.get("items"));
        return ResponseEntity.ok().build();
    }
}
