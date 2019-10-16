# Dapr, Azure Functions, and KEDA

This sample shows Dapr being used with Azure Functions and KEDA to create a ployglot Functions-as-a-Service application which leverages Dapr pub/sub. In it, a Python function is triggered by a message created in an Azure storage queue. This function then interacts with Dapr to publish that message to two subscribers: A C# and Javascript function that receive the event and process it accordingly.

## Run the sample

### Prerequisites

Setting up this sample requires you to have several components installed:

- [Install the Dapr CLI](https://github.com/dapr/cli)
- [Install Docker](https://docs.docker.com/install/)
- [Install kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Install Helm](https://github.com/helm/helm)
- [Install the Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
- [Install PowerShell Core 6](https://github.com/PowerShell/PowerShell)
- [Install the Azure Functions Core Tools](https://docs.microsoft.com/azure/azure-functions/functions-run-local#v2)

### Clone the sample repository
Clone this sample repository to your local machine:
```bash
git clone https://github.com/dapr/samples.git
```

### Run the setup script

Before running this script, note that this will provision the following resources into your Azure subscription and will incur associated costs:

- A Kubernetes service
- A container registry
- A storage account

To run the script, first log into the Azure CLI:

```powershell
az login
```

Then:

```powershell
./setup.ps1
```

You will be prompted for a name that determines the resource group where things will be deployed. It also serves as a base name for the resources themselves. Note that storage accounts can only accept lowercase alphanumeric characters and must start with an alpha character. Please set the base name accordingly.

You will also be prompted for the azure region in which to deploy these resources. For example: "westus"

This will create an entirely new cluster and configure it with this sample.

## Explore the configured sample

Once the sample script has completed, run the following command to see what pods are running:

```powershell
kubectl get pods -w
```

You should see that there are three pods for Dapr infrastructure, as well as some Redis pods. You'll also see two pods for the function projects: one for C#, and one for JavaScript. The Python function project should not be visible, and this is because it has scaled to zero using KEDA. We'll see this pod momentarily. The `-w` flag in the command we ran means that the view will update as new pods become available.

Navigate to the [Azure portal](https://portal.azure.com), and find the resource group based on the name you provided earlier. You should see all three of the resouces mentioned earlier.

Select the Storage account, and then it's "Storage Explorer (Preview)" option in the left-hand navigation. Select "Queues" and then "items". Click "Add message," provide your message text, and hit "OK."

If you head back to the terminal where you are running the `kubectl get pods -w` command, you should see a new pod enter the `ContainerCreating` state. This is the Python function app, being scaled out because KEDA saw a message sitting in the queue. Note that there are two containers created - one of them is the Dapr sidecar!

The Python function will consume the message from the queue and then use Dapr to publish a message that both the C# and Javascript apps have registered themselves to consume. You can check the logs for these apps to see them process the message. To do this, copy the name of the pod from the `kubectl get pods` command and run a `kubectl logs` command, as shown below:

```powershell
kubectl logs csharp-function-subscriber-7b874cd7f9-bqgsj csharp-function-subscriber
# OR
kubectl logs javascript-function-subscriber-6b9588c86-2zlxh javascript-function-subscriber
```

You should see log messages indicating that the message was processed.
