import dapr.ext.workflow as wf

wf_runtime = wf.WorkflowRuntime()

@wf_runtime.activity(name='idempotent_activity')
def idempotent_activity(ctx: wf.WorkflowActivityContext, order_item: Order) -> bool:
    """
    Beware of non-idempotent operations in an activity.
    Dapr Workflow guarantees at-least-once execution of activities, so activities might be executed more than once
    in case an activity is not ran to completion successfully.
    For instance, can you insert a record to a database twice without side effects?
         var insertSql = $"INSERT INTO Orders (Id, Description, UnitPrice, Quantity) VALUES ('{order_item.id}', '{order_item.description}', {order_item.unit_price}, {order_item.quantity})";
    It's best to perform a check if an record already exists before inserting it.
    """