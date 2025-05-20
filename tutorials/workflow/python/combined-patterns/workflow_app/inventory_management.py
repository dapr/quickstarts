from dapr.clients import DaprClient
from models import ProductInventory, ProductInventoryItem, OrderItem, UpdateInventoryResult 
import pickle

DAPR_INVENTORY_COMPONENT = "inventory"

def create_default_inventory() -> None:
    product_inventory_item = ProductInventoryItem(
        product_id="RBD001",
        product_name="Rubber Duck",
        quantity=50
    )

    with DaprClient() as dapr_client:
        dapr_client.save_state(
            store_name=DAPR_INVENTORY_COMPONENT,
            key=product_inventory_item.product_id,
            value=pickle.dumps(product_inventory_item)
        )

def get_inventory_item(product_id: str) -> ProductInventoryItem | None:
    with DaprClient() as dapr_client:
        state_response = dapr_client.get_state(
            store_name=DAPR_INVENTORY_COMPONENT,
            key=product_id
        )
        
        if not state_response.data:
            print(f'get_inventory_item: no state response', flush=True)
            return None
        product_inventory_item = pickle.loads(state_response.data)
        print(f'get_inventory_item: {product_inventory_item}', flush=True)
        return product_inventory_item

def check_inventory(order_item: OrderItem) -> bool:
    product_inventory_item = get_inventory_item(order_item.product_id)
    if product_inventory_item is None:
        return False
    else:
        is_available = product_inventory_item.quantity >= order_item.quantity
        return is_available

def update_inventory(order_item: OrderItem) -> UpdateInventoryResult:
    product_inventory_item = get_inventory_item(order_item.product_id)

    if product_inventory_item is None:
        return UpdateInventoryResult(is_success=False, message=f"Product not in inventory: {order_item.ProductName}")

    if product_inventory_item.quantity < order_item.quantity:
        return UpdateInventoryResult(is_success=False, message=f"Inventory not sufficient for: {order_item.ProductName}")

    updated_inventory = ProductInventory(
        product_id=product_inventory_item.product_id,
        quantity=product_inventory_item.quantity - order_item.quantity
    )
    with DaprClient() as dapr_client:
        dapr_client.save_state(
            store_name=DAPR_INVENTORY_COMPONENT,
            key=updated_inventory.product_id,
            value=pickle.dumps(updated_inventory)
        )
    return UpdateInventoryResult(is_success=True, message=f"Inventory updated for {order_item.product_name}")