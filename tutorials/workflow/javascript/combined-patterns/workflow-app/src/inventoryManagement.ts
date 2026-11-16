import { DaprClient } from "@dapr/dapr";
import { OrderItem, ProductInventoryItem, ActivityResult } from "./models";

const DAPR_INVENTORY_COMPONENT = "inventory";

const daprClient = new DaprClient();

/*
 * The inventory is kept with the Dapr state management API.
 * The `inventory` component is an in-memory state store (see the resources folder).
 */
export async function createDefaultInventory(): Promise<void> {
  const productInventoryItem: ProductInventoryItem = {
    product_id: "RBD001",
    product_name: "Rubber Duck",
    quantity: 50,
  };

  const result = await daprClient.state.save(DAPR_INVENTORY_COMPONENT, [
    { key: productInventoryItem.product_id, value: productInventoryItem },
  ]);
  if (result.error) {
    throw result.error;
  }
}

export async function getInventoryItem(productId: string): Promise<ProductInventoryItem | undefined> {
  const state = await daprClient.state.get(DAPR_INVENTORY_COMPONENT, productId);
  // The state API answers with an empty string when the key does not exist.
  if (!state || typeof state === "string") {
    console.log("getInventoryItem: no state response");
    return undefined;
  }
  const productInventoryItem = state as ProductInventoryItem;
  console.log(`getInventoryItem: ${JSON.stringify(productInventoryItem)}`);
  return productInventoryItem;
}

export async function checkInventory(orderItem: OrderItem): Promise<boolean> {
  const productInventoryItem = await getInventoryItem(orderItem.product_id);
  if (productInventoryItem === undefined) {
    return false;
  }
  return productInventoryItem.quantity >= orderItem.quantity;
}

export async function updateInventory(orderItem: OrderItem): Promise<ActivityResult> {
  const productInventoryItem = await getInventoryItem(orderItem.product_id);

  if (productInventoryItem === undefined) {
    return { is_success: false, message: `Product not in inventory: ${orderItem.product_name}` };
  }

  if (productInventoryItem.quantity < orderItem.quantity) {
    return { is_success: false, message: `Inventory not sufficient for: ${orderItem.product_name}` };
  }

  const result = await daprClient.state.save(DAPR_INVENTORY_COMPONENT, [
    {
      key: productInventoryItem.product_id,
      value: { ...productInventoryItem, quantity: productInventoryItem.quantity - orderItem.quantity },
    },
  ]);
  if (result.error) {
    throw result.error;
  }
  return { is_success: true, message: `Inventory updated for ${orderItem.product_name}` };
}
