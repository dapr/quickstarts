import sys
import threading
from time import sleep
from dapr.ext.workflow import WorkflowRuntime, DaprWorkflowClient
from workflow_activities import order_processing_workflow, notify_activity, process_payment_activity, verify_inventory_activity, update_inventory_activity, requst_approval_activity
from dapr.clients import DaprClient
from model import InventoryItem, OrderPayload
from util import get_address
import signal

store_name = "statestore-actors"

input_param_counter = 0
default_item_name = "cars"

class WorkflowConsoleApp:    
    def main(self):
        print("*** Welcome to the Dapr Workflow console app sample!")
        print("*** Using this app, you can place orders that start workflows.")
        print("*** Ensure that Dapr is running in a separate terminal window using the following command:")
        print("dapr run --dapr-grpc-port 50001 --app-id order-processor")
        # Wait for the sidecar to become available
        sleep(5)

        def timeout_error(*_):
            raise TimeoutError

        signal.signal(signal.SIGALRM, timeout_error)

        address = get_address()
        workflowRuntime = WorkflowRuntime()
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

        while True:
            client = DaprWorkflowClient(address["host"], address["port"])
            sleep(1)
            print("==========Begin the purchase of item:==========")
            items = ', '.join(str(inventory_item) for inventory_item in baseInventory.keys())
            
            try:
                print("To restock items, type 'restock'.")
                print("To exit workflow console app, type 'exit'.")
                signal.alarm(3)
                item_name = input(f'Enter the name of one of the following items to order: {items}: ')
                signal.alarm(0) # cancel the alarm
            except TimeoutError:
                global input_param_counter
                input_param_counter += 1
                if input_param_counter >= len(sys.argv):
                    item_name = default_item_name
                else:
                    item_name = sys.argv[input_param_counter]
            
            if item_name is None:
                continue
            elif item_name == "restock":
                self.restock_inventory(daprClient, baseInventory)
                continue
            elif item_name == "exit":
                print("Exiting workflow console app.")
                workflowRuntime.shutdown()
                break
            else:
                item_name = item_name.lower()
                if item_name not in baseInventory.keys():
                    print(f'We don\'t have {item_name}!')
                    continue
            try:
                signal.alarm(3)
                order_quantity = input(f'How many {item_name} would you like to purchase? ')
                signal.alarm(0) # cancel the alarm
            except TimeoutError:
                input_param_counter += 1
                if input_param_counter >= len(sys.argv):
                    order_quantity = 1
                else:
                    order_quantity = sys.argv[input_param_counter]
            try:
                int(order_quantity)
            except ValueError:
                print("Invalid input. Assuming you meant to type 1.")
                order_quantity = 1
            if  int(order_quantity) <= 0:
                print("Invalid input. Assuming you meant to type 1.")
                order_quantity = 1

            # item_name = default_item_name
            # order_quantity = 11

            total_cost = int(order_quantity) * baseInventory[item_name].per_item_cost
            order = OrderPayload(item_name=item_name, quantity=int(order_quantity), total_cost=total_cost)
            print(f'Starting order workflow, purchasing {order_quantity} of {item_name}')
            _id = client.schedule_new_workflow(order_processing_workflow, input=order)

            def prompt_for_approval(client: DaprWorkflowClient):
                try:
                    signal.alarm(3)
                    approved = input(f'(ID = {_id}) requires approval. Approve? [Y/N] ')
                    signal.alarm(0) # cancel the alarm
                except TimeoutError:
                    global input_param_counter
                    input_param_counter += 1
                    if input_param_counter >= len(sys.argv):
                        approved = "y"
                    else:
                        approved = sys.argv[input_param_counter]
                if state.runtime_status.name == "COMPLETED":
                    return
                if approved.lower() == "y":
                    client.raise_workflow_event(instance_id=_id, event_name="manager_approval", data={'approval': True})
                else:
                    client.raise_workflow_event(instance_id=_id, event_name="manager_approval", data={'approval': False})

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
                    if total_cost > 50000 and (state.runtime_status.name != "COMPLETED" or state.runtime_status.name != "FAILED") and not approval_seeked:
                        approval_seeked = True
                        # TODO - can it be main thread?
                        threading.Thread(target=prompt_for_approval(client), daemon=True).start()

            print("  Purchase of item is ", state.runtime_status.name)

    def restock_inventory(self, daprClient: DaprClient, baseInventory):
        for key, item in baseInventory.items():
            print(f'item: {item}')
            item_str = f'{{"name": "{item.item_name}", "quantity": {item.quantity}, "per_item_cost": {item.per_item_cost}}}'
            print(f'item_str: {item_str}')
            daprClient.save_state("statestore-actors", key, item_str)

if __name__ == '__main__':
    app = WorkflowConsoleApp()
    app.main()