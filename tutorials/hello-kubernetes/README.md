# Hello Kubernetes

This tutorial will get you up and running with Dapr in a Kubernetes cluster. You will be deploying the same applications from [Hello World](../hello-world). To recap, the Python App generates messages and the Node app consumes and persists them. The following architecture diagram illustrates the components that make up this quickstart:

![Architecture Diagram](./img/Architecture_Diagram.png)

## Prerequisites

This quickstart requires you to have the following installed on your machine:

- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- A Kubernetes cluster, such as [Minikube](https://docs.dapr.io/operations/hosting/kubernetes/cluster/setup-minikube/), [AKS](https://docs.dapr.io/operations/hosting/kubernetes/cluster/setup-aks/) or [GKE](https://cloud.google.com/kubernetes-engine/)

Also, unless you have already done so, clone the repository with the quickstarts and `cd` into the right directory:

```
git clone [-b <dapr_version_tag>] https://github.com/dapr/quickstarts.git
cd quickstarts/tutorials/hello-kubernetes
```

> **Note**: See https://github.com/dapr/quickstarts#supported-dapr-runtime-version for supported tags. Use `git clone https://github.com/dapr/quickstarts.git` when using the edge version of dapr runtime.

## Step 1 - Setup Dapr on your Kubernetes cluster

The first thing you need is an RBAC enabled Kubernetes cluster. This could be running on your machine using Minikube, or it could be a fully-fledged cluster in Azure using [AKS](https://azure.microsoft.com/en-us/services/kubernetes-service/).

Once you have a cluster, follow the steps below to deploy Dapr to it. For more details, see [Deploy Dapr on a Kubernetes cluster](https://docs.dapr.io/operations/hosting/kubernetes/kubernetes-deploy/).

> Please note, the CLI will install to the dapr-system namespace by default. If this namespace does not exist, the CLI will create it.
> If you need to deploy to a different namespace, you can use `-n mynamespace`.

```
dapr init --kubernetes --wait
```

Sample output:

```
⌛  Making the jump to hyperspace...
  Note: To install Dapr using Helm, see here: https://docs.dapr.io/getting-started/install-dapr-kubernetes/#install-with-helm-advanced

✅  Deploying the Dapr control plane to your cluster...
✅  Success! Dapr has been installed to namespace dapr-system. To verify, run `dapr status -k' in your terminal. To get started, go here: https://aka.ms/dapr-getting-started
```

> Without the `--wait` flag the Dapr CLI will exit as soon as the kubernetes deployments are created. Kubernetes deployments are asyncronous by default, so we use `--wait` here to make sure the dapr control plane is completely deployed and running before continuing.

<!-- STEP
name: Check dapr status
-->

```bash
dapr status -k
```

<!-- END_STEP -->

You will see output like the following. All services should show `True` in the HEALTHY column and `Running` in the STATUS column before you continue.

```
  NAME                   NAMESPACE    HEALTHY  STATUS   REPLICAS  VERSION  AGE  CREATED
  dapr-operator          dapr-system  True     Running  1         1.0.1    13s  2021-03-08 11:00.21
  dapr-placement-server  dapr-system  True     Running  1         1.0.1    13s  2021-03-08 11:00.21
  dapr-dashboard         dapr-system  True     Running  1         0.6.0    13s  2021-03-08 11:00.21
  dapr-sentry            dapr-system  True     Running  1         1.0.1    13s  2021-03-08 11:00.21
  dapr-sidecar-injector  dapr-system  True     Running  1         1.0.1    13s  2021-03-08 11:00.21
```

## Step 2 - Create and configure a state store

Dapr can use a number of different state stores (Redis, CosmosDB, DynamoDB, Cassandra, etc) to persist and retrieve state. This demo will use Redis.

1. Follow [these steps](https://docs.dapr.io/getting-started/tutorials/configure-state-pubsub/#step-1-create-a-redis-store) to create a Redis store.
2. Once your store is created, add the keys to the `redis.yaml` file in the `deploy` directory.
   > **Note:** the `redis.yaml` file provided in this quickstart will work securely out-of-the-box with a Redis installed with `helm install bitnami/redis`. If you have your own Redis setup, replace the `redisHost` value with your own Redis master address, and the redisPassword with your own Secret. You can learn more [here](https://docs.dapr.io/operations/components/component-secrets/).
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
sleep: 70
expected_stdout_lines:
  - "service/nodeapp created"
  - "deployment.apps/nodeapp created"
  - 'deployment "nodeapp" successfully rolled out'
-->

```bash
kubectl apply -f ./deploy/node.yaml
```

Kubernetes deployments are asyncronous. This means you'll need to wait for the deployment to complete before moving on to the next steps. You can do so with the following command:

```bash
kubectl rollout status deploy/nodeapp
```

<!-- END_STEP -->

This will deploy the Node.js app to Kubernetes. The Dapr control plane will automatically inject the Dapr sidecar to the Pod. If you take a look at the `node.yaml` file, you will see how Dapr is enabled for that deployment:

`dapr.io/enabled: true` - this tells the Dapr control plane to inject a sidecar to this deployment.

`dapr.io/app-id: nodeapp` - this assigns a unique id or name to the Dapr application, so it can be sent messages to and communicated with by other Dapr apps.

`dapr.io/enable-api-logging: "true"` - this is added to node.yaml file by default to see the API logs.

You'll also see the container image that you're deploying. If you want to update the code and deploy a new image, see **Next Steps** section.

There are several different ways to access a Kubernetes service depending on which platform you are using. Port forwarding is one consistent way to access a service, whether it is hosted locally or on a cloud Kubernetes provider like AKS.

<!-- STEP
name: Port forward
background: true
sleep: 2
timeout_seconds: 10
expected_return_code:
-->

```bash
kubectl port-forward service/nodeapp 8080:80
```

<!-- END_STEP -->

This will make your service available on http://localhost:8080.

> **Optional**: If you are using a public cloud provider, you can substitue your EXTERNAL-IP address instead of port forwarding. You can find it with:

```bash
kubectl get svc nodeapp
```

## Step 4 - Verify Service

To call the service that you set up port forwarding to, from a command prompt run:

<!-- STEP
name: Curl Test
expected_stdout_lines:
  - '{"DAPR_HTTP_PORT":"3500","DAPR_GRPC_PORT":"50001"}'
-->

```bash
curl http://localhost:8080/ports
```

<!-- END_STEP -->

Expected output:

```
{"DAPR_HTTP_PORT":"3500","DAPR_GRPC_PORT":"50001"}
```

Next submit an order to the app

<!-- STEP
name: neworder Test
expected_stdout_lines:
  - ''
-->

```bash
curl --request POST --data "@sample.json" --header Content-Type:application/json http://localhost:8080/neworder
```

<!-- END_STEP -->

Expected output:
Empty reply from server

Confirm the order was persisted by requesting it from the app

<!-- STEP
name: order Test
expected_stdout_lines:
  - '{"orderId":"42"}'
-->

```bash
curl http://localhost:8080/order
```

Expected output:

```json
{ "orderId": "42" }
```

<!-- END_STEP -->

> **Optional**: Now it would be a good time to get acquainted with the [Dapr dashboard](https://docs.dapr.io/reference/cli/dapr-dashboard/). Which is a convenient interface to check status, information and logs of applications running on Dapr. The following command will make it available on http://localhost:9999/.

```bash
dapr dashboard -k -p 9999
```

## Step 5 - Deploy the Python app with the Dapr sidecar

Next, take a quick look at the Python app. Navigate to the Python app in the kubernetes quickstart: `cd quickstarts/tutorials/hello-kubernetes/python` and open `app.py`.

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
sleep: 11
expected_stdout_lines:
  - deployment.apps/pythonapp created
  - 'deployment "pythonapp" successfully rolled out'
-->

Deploy the Python app to your Kubernetes cluster:

```bash
kubectl apply -f ./deploy/python.yaml
```

As with above, the following command will wait for the deployment to complete:

```bash
kubectl rollout status deploy/pythonapp
```

<!-- END_STEP -->

## Step 6 - Observe messages

Now that the Node.js and Python applications are deployed, watch messages come through:

Get the logs of the Node.js app:

<!-- TODO(artursouza): Add "Successfully persisted state for Order ID: X" once the new image is published -->

<!-- STEP
expected_stdout_lines:
  - "Got a new order! Order ID: 8"
  - "Got a new order! Order ID: 9"
  - "Got a new order! Order ID: 10"
  - "Got a new order! Order ID: 11"
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
Successfully persisted state.
Got a new order! Order ID: 2
Successfully persisted state.
Got a new order! Order ID: 3
Successfully persisted state.
```

## Step 7 - Observe API call logs

Now that the Node.js and Python applications are deployed, watch API call logs come through:

Get the API call logs of the node app:

<!-- STEP
expected_stdout_lines:
  - 'method="POST /v1.0/state/statestore"'
expected_stderr_lines:
output_match_mode: substring
name: Read nodeapp logs
-->

```bash
kubectl logs --selector=app=node -c daprd --tail=-1
```

<!-- END_STEP -->

When save state API calls are made, you should see logs similar to this:

```
time="2022-04-25T22:46:09.82121774Z" level=info method="POST /v1.0/state/statestore" app_id=nodeapp instance=nodeapp-7dd6648dd4-7hpmh scope=dapr.runtime.http-info type=log ver=1.7.2
time="2022-04-25T22:46:10.828764787Z" level=info method="POST /v1.0/state/statestore" app_id=nodeapp instance=nodeapp-7dd6648dd4-7hpmh scope=dapr.runtime.http-info type=log ver=1.7.2
```

Get the API call logs of the Python app:

<!-- STEP
expected_stdout_lines:
  - 'method="POST /neworder"'
expected_stderr_lines:
output_match_mode: substring
name: Read pythonapp logs
-->

```bash
kubectl logs --selector=app=python -c daprd --tail=-1
```
<!-- END_STEP -->

```
time="2022-04-27T02:47:49.972688145Z" level=info method="POST /neworder" app_id=pythonapp instance=pythonapp-545df48d55-jvj52 scope=dapr.runtime.http-info type=log ver=1.7.2
time="2022-04-27T02:47:50.984994545Z" level=info method="POST /neworder" app_id=pythonapp instance=pythonapp-545df48d55-jvj52 scope=dapr.runtime.http-info type=log ver=1.7.2
```

## Step 8 - Confirm successful persistence

Call the Node.js app's order endpoint to get the latest order. Grab the external IP address that you saved before and, append "/order" and perform a GET request against it (enter it into your browser, use Postman, or curl it!):

```
curl $NODE_APP/order
{"orderID":"42"}
```

You should see the latest JSON in response!

## Step 9 - Cleanup

Once you're done, you can spin down your Kubernetes resources by navigating to the `./deploy` directory and running:

<!-- STEP
name: "Delete resources from Kubernetes"
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

- Explore additional [quickstarts](../../README.md#quickstarts) and deploy them locally or on Kubernetes.
