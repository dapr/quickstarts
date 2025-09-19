package io.dapr.quickstarts.workflows.activities;

import io.dapr.workflows.WorkflowActivity;
import io.dapr.workflows.WorkflowActivityContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * ValidatePaymentMethodActivity for Payment Service - validates payment methods.
 * This activity is called cross-app from the main workflow (written in Go).
 */
 public class ValidatePaymentMethodActivity implements WorkflowActivity {
     private static final Logger logger = LoggerFactory.getLogger(ValidatePaymentMethodActivity.class);

     @Override
     public Object run(WorkflowActivityContext context) {
         logger.info("=== Payment Service: ValidatePaymentMethodActivity STARTED ===");

         try {
             // Get the order input
             Object inputObj = context.getInput(Object.class);
             logger.info("Received order: {}", inputObj);

             // Simple payment validation logic
             String result = "Payment validated successfully by payment service";

             logger.info("=== Payment Service: ValidatePaymentMethodActivity COMPLETED SUCCESSFULLY ===");
             return result;

         } catch (Exception e) {
             logger.error("ERROR in ValidatePaymentMethodActivity: {}", e.getMessage(), e);
             throw e;
         }
     }