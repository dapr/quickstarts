import threading
from time import sleep
from dapr.ext.workflow import WorkflowRuntime, DaprWorkflowClient, DaprWorkflowContext
from workflow_activities import order_processing_workflow, notify_activity, process_payment_activity, reserve_inventory_activity, update_inventory_activity, requst_approval_activity
from dapr.clients import DaprClient
from dapr.conf import Settings
from model import InventoryItem, OrderPayload

settings = Settings()

store_name = "statestore-actors"

class WorkflowConsoleApp:

    def main(self):
        host = settings.DAPR_RUNTIME_HOST
        if host is None:
            host = "localhost"
        port = settings.DAPR_GRPC_PORT
        if port is None:
            port = "4001"

        print("*** Welcome to the Dapr Workflow console app sample!")
        print("*** Using this app, you can place orders that start workflows.")
        print("*** Ensure that Dapr is running in a separate terminal window using the following command:")

        # Wait for the sidecar to become available
        # sleep(5)

        daprClient = DaprClient(f'{host}:{port}')
        baseInventory = {}
        baseInventory["paperclip"] = InventoryItem("Paperclip", 5, 100)
        baseInventory["cars"] = InventoryItem("Cars", 15000, 100)
        baseInventory["computers"] = InventoryItem("Computers", 500, 100)

        self.restock_inventory(daprClient, baseInventory)

        while True:
            workflowRuntime = WorkflowRuntime()
            workflowRuntime.register_workflow(order_processing_workflow)
            workflowRuntime.register_activity(notify_activity)
            workflowRuntime.register_activity(requst_approval_activity)
            workflowRuntime.register_activity(reserve_inventory_activity)
            workflowRuntime.register_activity(process_payment_activity)
            workflowRuntime.register_activity(update_inventory_activity)
            workflowRuntime.start()

            client = DaprWorkflowClient(host,port)
            sleep(1)
            print("==========Begin the purchase of item:==========")
            items = ', '.join(str(inventory_item) for inventory_item in baseInventory.keys())
            
            print("To restock items, type 'restock'.")
            item_name = input(f'Enter the name of one of the following items to order: {items}: ')
            
            if item_name is None:
                continue
            elif item_name == "restock":
                self.restock_inventory(daprClient, baseInventory)
                continue
            else:
                item_name = item_name.lower()
                if item_name not in baseInventory.keys():
                    print(f'We don\'t have {item_name}!')
                    continue
            order_quantity = input(f'How many {item_name} would you like to purchase? ')
            try:
                int(order_quantity)
            except ValueError:
                print("Invalid input. Assuming you meant to type 1.")
                order_quantity = 1
            if  int(order_quantity) <= 0:
                print("Invalid input. Assuming you meant to type 1.")
                order_quantity = 1

            total_cost = int(order_quantity) * baseInventory[item_name].per_item_cost
            order = OrderPayload(item_name=item_name, quantity=int(order_quantity), total_cost=total_cost, host=host, port=port)
            print(f'Starting order workflow, purchasing {order_quantity} of {item_name}')
            _id = client.schedule_new_workflow(order_processing_workflow, input=order)

            def prompt_for_approval(client: DaprWorkflowClient):
                sleep(7)
                approved = input(f'(ID = {_id}) requires approval. Approve? [Y/N]')
                if approved.lower() == "y":
                    client.raise_workflow_event(instance_id=_id, event_name="manager_approval", data="approved")
                else:
                    client.raise_workflow_event(instance_id=_id, event_name="manager_approval", data="rejected")

            # Prompt the user for approval on a background thread
            if total_cost > 50000:
                threading.Thread(target=prompt_for_approval(client), daemon=True).start()

            while True:
                try:
                    sleep(1)
                    state = client.wait_for_workflow_completion(_id, timeout_in_seconds=10)
                    if not state:
                        print("Workflow not found!")  # not expected
                    elif state.runtime_status.name == "COMPLETED" or state.runtime_status.name == "FAILED":
                        print(f'Workflow completed! Result: {state.serialized_output}')
                        break
                    elif total_cost > 50000:
                        print(f'Workflow status: {state.runtime_status.name}')
                        prompt_for_approval(client)  # raises an exception
                except TimeoutError:
                    pass

            status = client.wait_for_workflow_completion(_id, timeout_in_seconds=25)
            print("  Purchase of item is ", status.runtime_status.name)
            workflowRuntime.shutdown()

    def restock_inventory(self, daprClient: DaprClient, baseInventory):
        for key, item in baseInventory.items():
            print(f'item: {item}')
            item_str = f'{{"name": "{item.item_name}", "quantity": {item.quantity}, "per_item_cost": {item.per_item_cost}}}'
            print(f'item_str: {item_str}')
            daprClient.save_state("statestore-actors", key, item_str)

if __name__ == '__main__':
    app = WorkflowConsoleApp()
    app.main()