package com.service;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

/**
 * SpringBoot Controller to handle jobs callback.
 */
@RestController
public class JobController {

    /**
     * Handles jobs callback from Dapr.
     *
     * @param jobName name of the job.
     * @param payload data from the job if payload exists.
     * @return Empty Mono.
     */
    @PostMapping("/job/{jobName}")
    public Mono<Void> handleJob(@PathVariable("jobName") String jobName,
                                @RequestBody(required = false) byte[] payload) {
        System.out.println("Starting Droid: " + jobName);
        System.out.println("Executing Maintenance: " + new String(payload));

        return Mono.empty();
    }
}
