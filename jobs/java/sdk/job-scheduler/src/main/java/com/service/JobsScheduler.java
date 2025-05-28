package com.service;

import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.DeleteJobRequest;
import io.dapr.client.domain.GetJobRequest;
import io.dapr.client.domain.GetJobResponse;
import io.dapr.client.domain.JobSchedule;
import io.dapr.client.domain.ScheduleJobRequest;
import io.dapr.config.Properties;
import io.dapr.config.Property;

import java.util.Map;

public class JobsScheduler {

    /**
     * The main method of this app to register and fetch jobs.
     */
    public static void main(String[] args) throws Exception {
        Map<Property<?>, String> overrides = Map.of(
                Properties.HTTP_PORT, "6390",
                Properties.GRPC_PORT, "6200"
        );

        try (DaprPreviewClient client = new DaprClientBuilder().withPropertyOverrides(overrides).buildPreviewClient()) {
            scheduleAndRetrieveJob(client, "R2-D2", "* * * * * *", "Hello from R2-D2!");
            scheduleAndRetrieveJob(client, "C-3PO", "*/5 * * * * *", "Hello from C-3PO!");

            // Delete the C-3PO Job
            DeleteJobRequest deleteJobRequest = new DeleteJobRequest("C-3PO");

            System.out.println("**** Deleting a Job with name C-3PO *****");
            client.deleteJob(deleteJobRequest).block();
            System.out.println("**** Deleted a Job with name C-3PO *****");
        }
    }

    private static void scheduleAndRetrieveJob(DaprPreviewClient client, String jobName, String cron, String data) {
        scheduleJob(client, jobName, cron, data);
        retrieveJob(client, jobName);
    }

    private static void scheduleJob(DaprPreviewClient client, String jobName, String cron, String data) {
        System.out.println("**** Scheduling a Job with name " + jobName + " *****");
        ScheduleJobRequest request = new ScheduleJobRequest(jobName,
                JobSchedule.fromString(cron)).setData(data.getBytes());
        client.scheduleJob(request).block();
        System.out.println("**** Scheduling job " + jobName + " completed *****");
    }

    private static void retrieveJob(DaprPreviewClient client, String jobName) {
        System.out.println("**** Retrieving a Job with name " + jobName + " *****");
        GetJobResponse response = client.getJob(new GetJobRequest(jobName)).block();
        System.out.println("Job Name: " + response.getName());
    }
}