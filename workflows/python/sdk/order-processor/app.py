import sys
import threading
from time import sleep
from dapr.ext.workflow import WorkflowRuntime, DaprWorkflowClient
from workflow import order_processing_workflow, notify_activity, process_payment_activity, \
    verify_inventory_activity, update_inventory_activity, requst_approval_activity
from dapr.clients import DaprClient
from model import InventoryItem, OrderPayload
from util import get_address

store_name = "statestore-actors"

default_item_name = "cars"

class WorkflowConsoleApp:    
    def main(self):
        print("*** Welcome to the Dapr Workflow console app sample!")
        print("*** Using this app, you can place orders that start workflows.")
        print("*** Ensure that Dapr is running in a separate terminal window using the following command:")
        print("dapr run --dapr-grpc-port 4001 --app-id order-processor")
        # Wait for the sidecar to become available
        sleep(5)

        address = get_address()
        workflowRuntime = WorkflowRuntime(address=f'{address["host"]}:{address["port"]}')
        workflowRuntime.register_workflow(order_processing_workflow)
        workflowRuntime.register_activity(notify_activity)
        workflowRuntime.register_activity(requst_approval_activity)
        workflowRuntime.register_activity(verify_inventory_activity)
        workflowRuntime.register_activity(process_payment_activity)
        workflowRuntime.register_activity(update_inventory_activity)
        workflowRuntime.start()

        daprClient = DaprClient(address=f'{address["host"]}:{address["port"]}')
        baseInventory = {}
        baseInventory["paperclip"] = InventoryItem("Paperclip", 5, 100)
        baseInventory["cars"] = InventoryItem("Cars", 15000, 100)
        baseInventory["computers"] = InventoryItem("Computers", 500, 100)

        self.restock_inventory(daprClient, baseInventory)

        client = DaprWorkflowClient(address["host"], address["port"])
        print("==========Begin the purchase of item:==========")        
        item_name = default_item_name
        order_quantity = 11

        total_cost = int(order_quantity) * baseInventory[item_name].per_item_cost
        order = OrderPayload(item_name=item_name, quantity=int(order_quantity), total_cost=total_cost)
        print(f'Starting order workflow, purchasing {order_quantity} of {item_name}')
        _id = client.schedule_new_workflow(order_processing_workflow, input=order)

        def prompt_for_approval(client: DaprWorkflowClient):
            client.raise_workflow_event(instance_id=_id, event_name="manager_approval", 
                                        data={'approval': True})

        approval_seeked = False
        while True:
            try:
                state = client.wait_for_workflow_completion(_id, timeout_in_seconds=10)
                if not state:
                    print("Workflow not found!")  # not expected
                elif state.runtime_status.name == "COMPLETED" or state.runtime_status.name == "FAILED":
                    print(f'Workflow completed! Result: {state.runtime_status.name}')
                    break
            except TimeoutError:
                state = client.get_workflow_state(_id)
                if total_cost > 50000 and (
                    state.runtime_status.name != "COMPLETED" or 
                    state.runtime_status.name != "FAILED" or
                    state.runtime_status.name != "TERMINATED"
                    ) and not approval_seeked:
                    approval_seeked = True
                    # TODO - can it be main thread?
                    threading.Thread(target=prompt_for_approval(client), daemon=True).start()

        print("Purchase of item is ", state.runtime_status.name)

    def restock_inventory(self, daprClient: DaprClient, baseInventory):
        for key, item in baseInventory.items():
            print(f'item: {item}')
            item_str = f'{{"name": "{item.item_name}", "quantity": {item.quantity},\
                          "per_item_cost": {item.per_item_cost}}}'
            daprClient.save_state("statestore-actors", key, item_str)

if __name__ == '__main__':
    app = WorkflowConsoleApp()
    app.main()