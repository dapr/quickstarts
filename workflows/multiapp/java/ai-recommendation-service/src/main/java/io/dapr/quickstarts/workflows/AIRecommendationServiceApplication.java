package io.dapr.quickstarts.workflows;

import io.dapr.workflows.runtime.WorkflowRuntime;
import io.dapr.workflows.runtime.WorkflowRuntimeBuilder;
import io.dapr.quickstarts.workflows.activities.GeneratePersonalizedRecommendationsActivity;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

/**
 * AIRecommendationServiceWorker - registers only the GeneratePersonalizedRecommendationsActivity.
 * This activity is called cross-app from the main workflow (written in Go).
 */
public class AIRecommendationServiceApplication {

    public static void main(String[] args) throws Exception {
        System.out.println("=== Starting AIRecommendationServiceWorker (GeneratePersonalizedRecommendationsActivity) ===");
        
        // Start HTTP server on port 50004
        HttpServer server = HttpServer.create(new InetSocketAddress(50004), 0);
        server.createContext("/health", new HealthHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("HTTP server started on port 50004");

        WorkflowRuntimeBuilder builder = new WorkflowRuntimeBuilder()
                .registerActivity(GeneratePersonalizedRecommendationsActivity.class);

        // Build and start the workflow runtime
        try (WorkflowRuntime runtime = builder.build()) {
            System.out.println("AIRecommendationServiceWorker started - registered GeneratePersonalizedRecommendationsActivity only");
            System.out.println("AI Recommendation Service is ready to receive multi-app activity calls...");
            System.out.println("Waiting for multi-app activity calls...");
            runtime.start();
        }
    }
    
    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = "AI Recommendation Service is running";
            exchange.sendResponseHeaders(200, response.length());
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }
}
