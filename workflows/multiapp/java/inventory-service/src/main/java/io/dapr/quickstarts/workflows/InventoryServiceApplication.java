package io.dapr.quickstarts.workflows;

import io.dapr.workflows.runtime.WorkflowRuntime;
import io.dapr.workflows.runtime.WorkflowRuntimeBuilder;
import io.dapr.quickstarts.workflows.activities.ReserveInventoryActivity;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

/**
 * InventoryServiceWorker - registers only the ReserveInventoryActivity.
 * This app will handle multi-app activity calls from the main workflow.
 */
public class InventoryServiceApplication {

    public static void main(String[] args) throws Exception {
        System.out.println("=== Starting InventoryServiceWorker (ReserveInventoryActivity) ===");
        
        // Start HTTP server on port 50003
        HttpServer server = HttpServer.create(new InetSocketAddress(50003), 0);
        server.createContext("/health", new HealthHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("HTTP server started on port 50003");

        WorkflowRuntimeBuilder builder = new WorkflowRuntimeBuilder()
                .registerActivity(ReserveInventoryActivity.class);

        // Build and start the workflow runtime
        try (WorkflowRuntime runtime = builder.build()) {
            System.out.println("InventoryServiceWorker started - registered ReserveInventoryActivity only");
            System.out.println("Inventory Service is ready to receive cross-app activity calls...");
            System.out.println("Waiting for cross-app activity calls...");
            runtime.start();
        }
    }
    
    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = "Inventory Service is running";
            exchange.sendResponseHeaders(200, response.length());
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }

}
