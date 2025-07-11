@Component
public class NonDeterministicWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      ctx.getLogger().info("Starting Workflow: " + ctx.getName());

      var orderItem = ctx.getInput(String.class);

      // Do not use non-deterministic operations in a workflow!
      // These operations will create a new value every time the
      // workflow is replayed.
      var orderId = UUID.randomUUID();;
      var orderDate = Instant.now();

      String idResult = ctx.callActivity(SubmitIdActivity.class.getName(), orderId, String.class).await();
      String dateResult = ctx.callActivity(SubmitDateActivity.class.getName(), orderDate, String.class).await();

      ctx.complete(idResult);
    };
  }
}

@Component
public class DeterministicWorkflow implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      ctx.getLogger().info("Starting Workflow: " + ctx.getName());

      var orderItem = ctx.getInput(String.class);

      // Do use these deterministic methods and properties on the WorkflowContext instead.
      // These operations create the same value when the workflow is replayed.
      var orderId = ctx.newUuid();;
      var orderDate = ctx.getCurrentInstant();

      String idResult = ctx.callActivity(SubmitIdActivity.class.getName(), orderId, String.class).await();
      String dateResult = ctx.callActivity(SubmitDateActivity.class.getName(), orderDate, String.class).await();

      ctx.complete(idResult);
    };
  }
}