from datetime import datetime
import threading
from time import sleep

from dapr.clients import DaprClient
from dapr.conf import settings
from dapr.ext.workflow import DaprWorkflowClient, WorkflowStatus

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
        order_quantity = 1
        total_cost = int(order_quantity) * baseInventory[item_name].per_item_cost
        order = OrderPayload(item_name=item_name, quantity=int(order_quantity), total_cost=total_cost)

        print(f'Starting order workflow, purchasing {order_quantity} of {item_name}', flush=True)
        instance_id = wfClient.schedule_new_workflow(
            workflow=order_processing_workflow, input=order.to_json())
        _id = instance_id

        def prompt_for_approval(wfClient: DaprWorkflowClient):
            """This is a helper function to prompt for approval.
            Not using the prompt here ACTUALLY, as quickstart validation is required to be automated.
            
            But, in case you may want to run this sample manually, you can uncomment the following lines:
                try:
                    signal.alarm(15)
                    approved = input(f'(ID = {_id}) requires approval. Approve? [Y/N] ')
                    signal.alarm(0) # cancel the alarm
                except TimeoutError:
                    approved = "y"
                if state.runtime_status.name == "COMPLETED":
                    return
                if approved.lower() == "y":
                    wfClient.raise_workflow_event(instance_id=_id, event_name="approval_event", data={'approval': True})
                else:
                    wfClient.raise_workflow_event(instance_id=_id, event_name="approval_event", data={'approval': False})

                ## Additionally, you would need to import signal and define timeout_error:
                # import signal
                # def timeout_error(*_):
                #     raise TimeoutError

                # signal.signal(signal.SIGALRM, timeout_error)
            """
            wfClient.raise_workflow_event(instance_id=_id, event_name="approval_event", data={'approval': True})

        approval_seeked = False
        start_time = datetime.now()
        while True:
            time_delta = datetime.now() - start_time
            state = wfClient.get_workflow_state(instance_id=_id)

            if not state:
                print("Workflow not found!")  # not expected
                break

            if state.runtime_status in {WorkflowStatus.COMPLETED, WorkflowStatus.FAILED, WorkflowStatus.TERMINATED}:
                print(f'Workflow completed! Result: {state.runtime_status}', flush=True)
                break


            if time_delta.total_seconds() >= 10:
                state = wfClient.get_workflow_state(instance_id=_id)
                if total_cost > 5000 and state not in {WorkflowStatus.COMPLETED, WorkflowStatus.FAILED, WorkflowStatus.TERMINATED} and not approval_seeked:
                    approval_seeked = True
                    threading.Thread(target=prompt_for_approval(wfClient), daemon=True).start()

        wfr.shutdown()

            

    def restock_inventory(self, daprClient: DaprClient, baseInventory):
        for key, item in baseInventory.items():
            print(f'item: {item}')
            item_str = f'{{"name": "{item.item_name}", "quantity": {item.quantity},\
                          "per_item_cost": {item.per_item_cost}}}'
            daprClient.save_state(store_name, key, item_str)

if __name__ == '__main__':
    app = WorkflowConsoleApp()
    app.main()
