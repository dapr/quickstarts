package com.service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Spring Boot application to demonstrate Dapr Jobs callback API.
 * <p>
 * This application demonstrates how to use Dapr Jobs API with Spring Boot.
 * </p>
 */
@SpringBootApplication
public class JobServiceStartup {

    public static void main(String[] args) throws Exception {
        SpringApplication.run(JobServiceStartup.class, args);
    }
}
