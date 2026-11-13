import { WorkflowActivityContext } from "@dapr/dapr";
import { Order } from "./activities";

export async function idempotentActivity(_ctx: WorkflowActivityContext, orderItem: Order): Promise<boolean> {
  /*
   * Beware of non-idempotent operations in an activity.
   * Dapr Workflow guarantees at-least-once execution of activities, so activities might be executed more than once
   * in case an activity is not ran to completion successfully.
   * For instance, can you insert a record to a database twice without side effects?
   *      const insertSql = `INSERT INTO Orders (Id, Description, UnitPrice, Quantity) VALUES ('${orderItem.id}', '${orderItem.description}', ${orderItem.unitPrice}, ${orderItem.quantity})`;
   * It's best to perform a check if an record already exists before inserting it.
   */
  return true;
}
