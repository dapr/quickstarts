@Component
public class LargePayloadSizeWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      ctx.getLogger().info("Starting Workflow: " + ctx.getName());

      var docId = ctx.getInput(String.class);

      // Do not pass large payloads between activities.
      // They are stored in the Dapr state store twice, one as output argument 
      // for GetDocument, and once as input argument for UpdateDocument.
      var document = ctx.callActivity(GetDocument.class.getName(), docId, LargeDocument.class).await();
      var updatedDocument = ctx.callActivity(UpdateDocument.class.getName(), document, LargeDocument.class).await();

      // More activities to process the updated document...

      ctx.complete(updatedDocument);
    };
  }
}

@Component
public class SmallPayloadSizeWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      ctx.getLogger().info("Starting Workflow: " + ctx.getName());

      var docId = ctx.getInput(String.class);

      // Do pass small payloads between activities, preferably IDs only, or objects that are quick to (de)serialize in large volumes.
      // Combine multiple actions, such as document retrieval and update, into a single activity.
      docId = ctx.callActivity(GetAndUpdateDocument.class.getName(), docId, String.class).await();

      // More activities to process the updated document...

      ctx.complete(docId);
    };
  }
}