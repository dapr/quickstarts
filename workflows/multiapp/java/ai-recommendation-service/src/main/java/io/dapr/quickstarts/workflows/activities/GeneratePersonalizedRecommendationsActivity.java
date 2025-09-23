package io.dapr.quickstarts.workflows.activities;

import io.dapr.workflows.WorkflowActivity;
import io.dapr.workflows.WorkflowActivityContext;

/**
 * GeneratePersonalizedRecommendationsActivity for AI Recommendation Service - generates AI recommendations.
 * This activity is called cross-app from the main workflow.
 */
public class GeneratePersonalizedRecommendationsActivity implements WorkflowActivity {
    @Override
    public Object run(WorkflowActivityContext context) {
        var logger = context.getLogger();
        logger.info("=== AI Recommendation Service: GeneratePersonalizedRecommendationsActivity STARTED ===");
        
        try {
            Object inputObj = context.getInput(Object.class);
            logger.info("Received order: {}", inputObj);
            
            // Create RecommendationResult object
            RecommendationResult result = new RecommendationResult();
            result.success = true;
            result.recommendations = new RecommendedItem[]{
                new RecommendedItem("PROD-003", "Wireless Headphones", 99.99, "Based on your laptop purchase"),
                new RecommendedItem("PROD-004", "USB-C Hub", 49.99, "Complements your laptop setup")
            };
            result.message = "AI recommendations generated successfully by AI recommendation service";
            logger.info("=== AI Recommendation Service: GeneratePersonalizedRecommendationsActivity COMPLETED SUCCESSFULLY ===");

            return result;
        } catch (Exception e) {
            logger.error("ERROR in GeneratePersonalizedRecommendationsActivity: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    // RecommendationResult class (to match Go struct)
    public static class RecommendationResult {
        public boolean success;
        public RecommendedItem[] recommendations;
        public String message;
        
        @Override
        public String toString() {
            return String.format("RecommendationResult{success=%s, recommendations=%d items, message='%s'}", 
                success, recommendations != null ? recommendations.length : 0, message);
        }
    }
    
    // RecommendedItem class (to match Go struct)
    public static class RecommendedItem {
        public String productId;
        public String name;
        public double price;
        public String reason;
        
        public RecommendedItem() {}
        
        public RecommendedItem(String productId, String name, double price, String reason) {
            this.productId = productId;
            this.name = name;
            this.price = price;
            this.reason = reason;
        }
    }
}
