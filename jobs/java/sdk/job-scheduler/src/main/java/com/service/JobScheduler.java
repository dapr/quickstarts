package com.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.DeleteJobRequest;
import io.dapr.client.domain.GetJobRequest;
import io.dapr.client.domain.GetJobResponse;
import io.dapr.client.domain.JobSchedule;
import io.dapr.client.domain.ScheduleJobRequest;
import io.dapr.config.Properties;
import io.dapr.config.Property;
import io.dapr.v1.DaprProtos;

import java.util.Map;

public class JobScheduler {

    /**
     * The main method of this app to register and fetch jobs.
     */
    public static void main(String[] args) throws Exception {
        Map<Property<?>, String> overrides = Map.of(
                Properties.HTTP_PORT, "6390",
                Properties.GRPC_PORT, "6200"
        );

        try (DaprPreviewClient client = new DaprClientBuilder().withPropertyOverrides(overrides).buildPreviewClient()) {

            // Schedule R2-D2 Job.
            String r2D2JobName = "R2-D2";
            scheduleJob(client, r2D2JobName, "* * * * * *", "Oil Change");
            Thread.sleep(5000);

            // Retrieve the R2-D2 Job details.
            retrieveJob(client, r2D2JobName);

            // Schedule C3PO Job.
            String c3POJobName = "C-3PO";
            scheduleJob(client, c3POJobName, "*/5 * * * * *", "Limb Calibration");
            Thread.sleep(5000);

            // Retrieve C3PO Job details.
            retrieveJob(client, c3POJobName);

            // Delete the C-3PO Job
            deleteJob(client, c3POJobName);
        }
    }

    private static void scheduleJob(DaprPreviewClient client, String jobName, String cron, String data)
            throws JsonProcessingException {
        System.out.println("Scheduling a Job with name " + jobName );
        ScheduleJobRequest request = new ScheduleJobRequest(jobName,
                JobSchedule.fromString(cron)).setData(data.getBytes());
        client.scheduleJob(request).block();

        ObjectMapper mapper = new ObjectMapper();
        System.out.println("Job Scheduled: " + mapper.writeValueAsString(request));
    }

    private static void retrieveJob(DaprPreviewClient client, String jobName) throws JsonProcessingException {
        System.out.println("Getting Job: " + jobName);
        GetJobResponse response = client.getJob(new GetJobRequest(jobName)).block();

        ObjectMapper mapper = new ObjectMapper();
        System.out.println("Job Details: " + mapper.writeValueAsString(response));
    }

    private static void deleteJob(DaprPreviewClient client, String jobName) {
        System.out.println("Deleting Job: " + jobName);
        client.deleteJob(new DeleteJobRequest(jobName)).block();
        System.out.println("Deleted Job: " + jobName);
    }
}
