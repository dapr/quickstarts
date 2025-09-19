package io.dapr.quickstarts.workflows;

import io.dapr.workflows.runtime.WorkflowRuntime;
import io.dapr.workflows.runtime.WorkflowRuntimeBuilder;
import io.dapr.quickstarts.workflows.activities.ValidatePaymentMethodActivity;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;

/**
 * PaymentServiceWorker - registers only the ValidatePaymentMethodActivity.
 * This app will handle cross-app activity calls from the main workflow (written in Go).
 */
public class PaymentServiceApplication {

    public static void main(String[] args) throws Exception {
        System.out.println("=== Starting PaymentServiceWorker (ValidatePaymentMethodActivity) ===");
        
        // Start HTTP server on port 50002
        HttpServer server = HttpServer.create(new InetSocketAddress(50002), 0);
        server.createContext("/health", new HealthHandler());
        server.setExecutor(null);
        server.start();
        System.out.println("HTTP server started on port 50002");

        WorkflowRuntimeBuilder builder = new WorkflowRuntimeBuilder()
                .registerActivity(ValidatePaymentMethodActivity.class);

        // Build and start the workflow runtime
        try (WorkflowRuntime runtime = builder.build()) {
            System.out.println("PaymentServiceWorker started - registered ValidatePaymentMethodActivity only");
            System.out.println("Payment Service is ready to receive cross-app activity calls...");
            System.out.println("Waiting for cross-app activity calls...");
            runtime.start();
        }
    }
    
    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String response = "Payment Service is running";
            exchange.sendResponseHeaders(200, response.length());
            OutputStream os = exchange.getResponseBody();
            os.write(response.getBytes());
            os.close();
        }
    }
}
