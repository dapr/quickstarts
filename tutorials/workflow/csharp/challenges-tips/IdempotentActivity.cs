using Dapr.Client;
using Dapr.Workflow;

namespace WorkflowApp;

internal sealed class IdempotentActivity : WorkflowActivity<string, string>
{
    public override async Task<InventoryResult> RunAsync(WorkflowActivityContext context, OrderItem orderItem)
    {
        // Beware of non-idempotent operations in an activity.
        // Dapr Workflow guarantees at-least-once execution of activities, so activities might be executed more than once
        // in case an activity is not ran to completion successfully.
        // For instance, can you insert a record to a database twice without side effects?
        //      var insertSql = $"INSERT INTO Orders (Id, Description, UnitPrice, Quantity) VALUES ('{orderItem.Id}', '{orderItem.Description}', {orderItem.UnitPrice}, {orderItem.Quantity})";
        // It's best to perform a check if an record already exists before inserting it.
    }
}

internal sealed record OrderItem(string Id, string Description, double UnitPrice, int Quantity);
