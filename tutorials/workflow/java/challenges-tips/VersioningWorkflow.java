/* 
  This is the initial version of the workflow.
  Note that the input argument for both activities is the orderItem (string).
*/
@Component
public class VersioningWorkflow1 implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      ctx.getLogger().info("Starting Workflow: " + ctx.getName());

      var orderItem = ctx.getInput(String.class);

      var resultA = ctx.callActivity(ActivityA.class.getName(), orderItem, Integer.class).await();
      var resultB = ctx.callActivity(ActivityB.class.getName(), orderItem, Integer.class).await();

      ctx.complete(resultA + resultB);
    };
  }
}

/* 
  This is the updated version of the workflow.
  The input for ActivityB has changed from orderItem (string) to resultA (int).
  If there are in-flight workflow instances that were started with the previous version
  of this workflow, these will fail when the new version of the workflow is deployed 
  and the workflow name remains the same, since the runtime parameters do not match with the persisted state.
  It is recommended to version workflows by creating a new workflow class with a new name:
  {workflowname}1 -> {workflowname}2
  Try to avoid making breaking changes in perpetual workflows (that use the `ContinueAsNew` method) 
  since these are difficult to replace with a new version.
*/
@Component
public class VersioningWorkflow1 implements Workflow {
  @Override
  public WorkflowStub create() {
    return ctx -> {
      ctx.getLogger().info("Starting Workflow: " + ctx.getName());

      var orderItem = ctx.getInput(String.class);

      var resultA = ctx.callActivity(ActivityA.class.getName(), orderItem, Integer.class).await();
      var resultB = ctx.callActivity(ActivityB.class.getName(), resultA, Integer.class).await();

      ctx.complete(resultA + resultB);
    };
  }
}