import os
from datetime import datetime
from time import sleep

from dapr.clients import DaprClient
from dapr.conf import settings
from dapr.ext.workflow import DaprWorkflowClient

from workflow import wfr, order_processing_workflow
from model import InventoryItem, OrderPayload

store_name = "statestore"
workflow_name = "order_processing_workflow"
default_item_name = "cars"

class WorkflowConsoleApp:    
    def main(self):
        print("*** Welcome to the Dapr Workflow console app sample!", flush=True)
        print("*** Using this app, you can place orders that start workflows.", flush=True)
        
        wfr.start()
        # Wait for the sidecar to become available
        sleep(5)

        wfClient = DaprWorkflowClient()

        baseInventory = {
            "paperclip": InventoryItem("Paperclip", 5, 100),
            "cars": InventoryItem("Cars", 5000, 10),
            "computers": InventoryItem("Computers", 500, 100),
        }


        daprClient = DaprClient(address=f'{settings.DAPR_RUNTIME_HOST}:{settings.DAPR_GRPC_PORT}')
        self.restock_inventory(daprClient, baseInventory)

        print("==========Begin the purchase of item:==========", flush=True)
        item_name = default_item_name
        order_quantity = 2
        total_cost = int(order_quantity) * baseInventory[item_name].per_item_cost
        order = OrderPayload(item_name=item_name, quantity=int(order_quantity), total_cost=total_cost)

        # The instance ID is the order ID. Set ORDER_ID to attach to an order that already exists.
        instance_id = os.environ.get('ORDER_ID') or datetime.now().strftime('order-%Y%m%d-%H%M%S')
        print(f'Order ID: {instance_id}', flush=True)

        state = wfClient.get_workflow_state(instance_id=instance_id, fetch_payloads=False)
        if state is None:
            wfClient.schedule_new_workflow(
                workflow=order_processing_workflow, input=order.to_json(), instance_id=instance_id)
            print(f'Started order {instance_id}.', flush=True)
        elif state.runtime_status.name in ('RUNNING', 'PENDING', 'SUSPENDED'):
            print(f'Order {instance_id} is already running. Waiting for it to finish.', flush=True)
        else:
            print(f'Workflow completed: {state.runtime_status.name}', flush=True)
            wfr.shutdown()
            return

        try:
            state = wfClient.wait_for_workflow_completion(instance_id=instance_id, timeout_in_seconds=900)
            if not state:
                print("Workflow not found!")
            else:
                print(f'Workflow completed: {state.runtime_status.name}', flush=True)
        except TimeoutError:
            print('*** Workflow timed out!')

        wfr.shutdown()

    def restock_inventory(self, daprClient: DaprClient, baseInventory):
        for key, item in baseInventory.items():
            # Write the inventory only when the key is absent, so a restart does not restock.
            if daprClient.get_state(store_name, key).data:
                continue
            print(f'item: {item}')
            item_str = f'{{"name": "{item.item_name}", "quantity": {item.quantity},\
                          "per_item_cost": {item.per_item_cost}}}'
            daprClient.save_state(store_name, key, item_str)

if __name__ == '__main__':
    app = WorkflowConsoleApp()
    app.main()
