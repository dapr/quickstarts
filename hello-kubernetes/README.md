# Hello Kubernetes

This tutorial will get you up and running with Dapr in a Kubernetes cluster. You will be deploying the same applications from [Hello World](../hello-world). To recap, the Python App generates messages and the Node app consumes and persists them. The following architecture diagram illustrates the components that make up this quickstart:

![Architecture Diagram](./img/Architecture_Diagram.png)


## Prerequisites
This quickstart requires you to have the following installed on your machine:
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- A Kubernetes cluster, such as [Minikube](https://docs.dapr.io/operations/hosting/kubernetes/cluster/setup-minikube/), [AKS](https://docs.dapr.io/operations/hosting/kubernetes/cluster/setup-aks/) or [GKE](https://cloud.google.com/kubernetes-engine/)

Also, unless you have already done so, clone the repository with the quickstarts and ````cd```` into the right directory:
```
git clone [-b <dapr_version_tag>] https://github.com/dapr/quickstarts.git
cd quickstarts
```
> **Note**: See https://github.com/dapr/quickstarts#supported-dapr-runtime-version for supported tags. Use `git clone https://github.com/dapr/quickstarts.git` when using the edge version of dapr runtime.

## Step 1 - Setup Dapr on your Kubernetes cluster

The first thing you need is an RBAC enabled Kubernetes cluster. This could be running on your machine using Minikube, or it could be a fully-fledged cluser in Azure using [AKS](https://azure.microsoft.com/en-us/services/kubernetes-service/).

Once you have a cluster, follow the steps below to deploy Dapr to it. For more details, look [here](https://docs.dapr.io/getting-started/install-dapr/#install-dapr-on-a-kubernetes-cluster)

> Please note, that using the CLI does not support non-default namespaces.
> If you need a non-default namespace, Helm has to be used (see below).

```
$ dapr init --kubernetes
ℹ️  Note: this installation is recommended for testing purposes. For production environments, please use Helm

⌛  Making the jump to hyperspace...
✅  Deploying the Dapr Operator to your cluster...
✅  Success! Dapr has been installed. To verify, run 'dapr status -k' in your terminal. To get started, go here: https://aka.ms/dapr-getting-started
```

## Step 2 - Create and configure a state store

Dapr can use a number of different state stores (Redis, CosmosDB, DynamoDB, Cassandra, etc) to persist and retrieve state. This demo will use Redis.

1. Follow [these steps](https://docs.dapr.io/getting-started/configure-redis/) to create a Redis store.
2. Once your store is created, add the keys to the `redis.yaml` file in the `deploy` directory.
    > **Note:** the `redis.yaml` file provided in this quickstart will work securely out-of-the-box with a Redis installed with `helm install bitnami/redis`. If you have your own Redis setup, replace the `redisHost` value  with your own Redis master address, and the redisPassword with your own Secret. You can learn more [here](https://docs.dapr.io/operations/components/component-secrets/).
3. Apply the `redis.yaml` file and observe that your state store was successfully configured!


<!-- STEP
name: Deploy redis config
sleep: 1
expected_stdout_lines:
  - "component.dapr.io/statestore created"
-->

```bash
kubectl apply -f ./deploy/redis.yaml
```

<!-- END_STEP -->

```bash
component.dapr.io/statestore created
```

## Step 3 - Deploy the Node.js app with the Dapr sidecar

<!-- STEP
name: Deploy Node App
sleep: 30
expected_stdout_lines:
  - "service/nodeapp created"
  - "deployment.apps/nodeapp created"
-->

```bash
kubectl apply -f ./deploy/node.yaml
```

<!-- END_STEP -->

This will deploy the Node.js app to Kubernetes. The Dapr control plane will automatically inject the Dapr sidecar to the Pod. If you take a look at the ```node.yaml``` file, you will see how Dapr is enabled for that deployment:

```dapr.io/enabled: true``` - this tells the Dapr control plane to inject a sidecar to this deployment.

```dapr.io/app-id: nodeapp``` - this assigns a unique id or name to the Dapr application, so it can be sent messages to and communicated with by other Dapr apps.

You'll also see the container image that you're deploying. If you want to update the code and deploy a new image, see **Next Steps** section.

This deployment provisions an External IP.
Wait until the IP is visible: (may take a few minutes)

```
kubectl get svc nodeapp
```

> Note: Minikube users cannot see the external IP. Instead, you can use `minikube service [service_name]` to access loadbalancer without external IP.

Once you have an external IP, save it.
You can also export it to a variable:

```
Linux/MacOS
export NODE_APP=$(kubectl get svc nodeapp --output 'jsonpath={.status.loadBalancer.ingress[0].ip}')

Windows
for /f "delims=" %a in ('kubectl get svc nodeapp --output 'jsonpath={.status.loadBalancer.ingress[0].ip}') do @set NODE_APP=%a
```

**Optional:** You can also use port forwarding if you don't have easy access to your Kubernetes cluster service IPs:

<!-- STEP
name: Port forward
background: true
sleep: 2
timeout_seconds: 1
expected_return_code:
-->

```bash
export NODE_APP=localhost:8080
kubectl port-forward service/nodeapp 8080:80
```

<!-- END_STEP -->

## Step 4 - Verify Service call using external IP
To call the service using the extracted external IP, from a command prompt run:

<!-- STEP
name: Curl Test
expected_stdout_lines:
  - '{"DAPR_HTTP_PORT":"3500","DAPR_GRPC_PORT":"50001"}'
env:
  NODE_APP: "localhost:8080"
-->

```bash
curl $NODE_APP/ports
```

<!-- END_STEP -->

Expected output:

```
{"DAPR_HTTP_PORT":"3500","DAPR_GRPC_PORT":"50001"}
```

> Note: This assumes that the external IP is available in the `NODE_APP` environment variable from the previous step.
Minikube users cannot see the external IP. Instead, you can use `minikube service [service_name]` to access loadbalancer without external IP. Then export it to an environment variable.

Here you can see that two ports are displayed. Both the ports have been injected when Dapr was enabled for this app. Additionally, in this quickstart the HTTP Port is used for further communication with the Dapr sidecar.

## Step 5 - Deploy the Python app with the Dapr sidecar
Next, take a quick look at the Python app. Navigate to the Python app in the kubernetes quickstart: `cd quickstarts/hello-kubernetes/python` and open `app.py`.

At a quick glance, this is a basic Python app that posts JSON messages to `localhost:3500`, which is the default listening port for Dapr. You can invoke the Node.js application's `neworder` endpoint by posting to `v1.0/invoke/nodeapp/method/neworder`. The message contains some `data` with an orderId that increments once per second:

```python
n = 0
while True:
    n += 1
    message = {"data": {"orderId": n}}

    try:
        response = requests.post(dapr_url, json=message)
    except Exception as e:
        print(e)

    time.sleep(1)
```

<!-- STEP
name: Deploy Python App
sleep: 30
expected_stdout_lines:
  - deployment.apps/pythonapp created
-->

Deploy the Python app to your Kubernetes cluster:

```bash
kubectl apply -f ./deploy/python.yaml
```

<!-- END_STEP -->

Now wait for the pod to be in ```Running``` state:

```
kubectl get pods --selector=app=python -w
```

## Step 6 - Observe messages

Now that the Node.js and Python applications are deployed, watch messages come through:

Get the logs of the Node.js app:

<!-- STEP
expected_stdout_lines:
  - "Node App listening on port 3000!"
  - "Successfully persisted state."
  - "Got a new order! Order ID: 8"
  - "Successfully persisted state."
  - "Got a new order! Order ID: 9"
  - "Successfully persisted state."
  - "Got a new order! Order ID: 10"
  - "Successfully persisted state."
  - "Got a new order! Order ID: 11"
  - "Successfully persisted state."
expected_stderr_lines:
name: Read nodeapp logs
-->

```bash
kubectl logs --selector=app=node -c node --tail=-1
```

<!-- END_STEP -->

If all went well, you should see logs like this:

```
Got a new order! Order ID: 1
Successfully persisted state
Got a new order! Order ID: 2
Successfully persisted state
Got a new order! Order ID: 3
Successfully persisted state
```

## Step 7 - Confirm successful persistence

Call the Node.js app's order endpoint to get the latest order. Grab the external IP address that you saved before and, append "/order" and perform a GET request against it (enter it into your browser, use Postman, or curl it!):

```
curl $NODE_APP/order
{"orderID":"42"}
```

You should see the latest JSON in response!

## Step 8 - Cleanup

Once you're done, you can spin down your Kubernetes resources by navigating to the `./deploy` directory and running:

<!-- STEP
name: "Deploy Kubernetes"
working_dir: "./deploy"
sleep: 10
expected_stdout_lines:
  - service "nodeapp" deleted
  - deployment.apps "nodeapp" deleted
  - deployment.apps "pythonapp" deleted
  - component.dapr.io "statestore" deleted
-->

```bash
kubectl delete -f .
```

<!-- END_STEP -->

This will spin down each resource defined by the .yaml files in the `deploy` directory, including the state component.

## Deploying your code

Now that you're successfully working with Dapr, you probably want to update the code to fit your scenario. The Node.js and Python apps that make up this quickstart are deployed from container images hosted on a private [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/). To create new images with updated code, you'll first need to install docker on your machine. Next, follow these steps:

1. Update Node or Python code as you see fit!
2. Navigate to the directory of the app you want to build a new image for.
3. Run `docker build -t <YOUR_IMAGE_NAME> . `. You can name your image whatever you like. If you're planning on hosting it on docker hub, then it should start with `<YOUR_DOCKERHUB_USERNAME>/`.
4. Once your image has built you can see it on your machines by running `docker images`.
5. To publish your docker image to docker hub (or another registry), first login: `docker login`. Then run`docker push <YOUR IMAGE NAME>`.
6. Update your .yaml file to reflect the new image name.
7. Deploy your updated Dapr enabled app: `kubectl apply -f <YOUR APP NAME>.yaml`.

## Related links
- [Guidelines for production ready deployments on Kubernetes](https://docs.dapr.io/operations/hosting/kubernetes/kubernetes-production/)

## Next steps
- Explore additional [quickstarts](../README.md#quickstarts) and deploy them locally or on Kubernetes.
