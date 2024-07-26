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

The first thing you need is an RBAC enabled Kubernetes cluster. This could be running on your machine using Minikube, or it could be a fully-fledged cluster in Azure using [AKS](https://azure.microsoft.com/en-us/services/kubernetes-service/).

## Using Dapr Multi-app run with Dapr `dev` mode deployment

### Step 1 - Setup Dapr dev mode on your Kubernetes cluster

Follow the steps below to deploy Dapr to Kubernetes using the `--dev` flag. For more details, see [Deploy Dapr on a Kubernetes cluster](https://docs.dapr.io/operations/hosting/kubernetes/kubernetes-deploy/).

  > **Note**: Any previous Dapr installations in the Kubernetes cluster need to be uninstalled first. You can use `dapr uninstall -k ` to remove Dapr

With the `dapr init -k --dev` command, the CLI will also install he Redis and Zipkin containers `dapr-dev-redis` and `dapr-dev-zipkin` in the `default` namespace apart from the `Dapr` control plane in `dapr-system` namespace. The `statestore`, `pubsub` and `appconfig`  default components and configuration are applied in the `default` Kubernetes namespace if they do not exist. You can use `dapr components -k` and `dapr configurations -k`to see these.


```bash
dapr init -k --dev
```

Expected output in a fresh Kubernetes cluster without Dapr installed:
```
⌛  Making the jump to hyperspace...
ℹ️  Note: To install Dapr using Helm, see here: https://docs.dapr.io/getting-started/install-dapr-kubernetes/#install-with-helm-advanced

ℹ️  Container images will be pulled from Docker Hub
✅  Deploying the Dapr control plane with latest version to your cluster...
✅  Deploying the Dapr dashboard with latest version to your cluster...
✅  Deploying the Dapr Redis with 17.14.5 version to your cluster...
✅  Deploying the Dapr Zipkin with latest version to your cluster...
ℹ️  Applying "statestore" component to Kubernetes "default" namespace.
ℹ️  Applying "pubsub" component to Kubernetes "default" namespace.
ℹ️  Applying "appconfig" zipkin configuration to Kubernetes "default" namespace.
✅  Success! Dapr has been installed to namespace dapr-system. To verify, run `dapr status -k' in your terminal. To get started, go here: https://aka.ms/dapr-getting-started
```

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
  dapr-dashboard         dapr-system  True     Running  1         0.14.0   41s  2024-07-22 13:53.05  
  dapr-operator          dapr-system  True     Running  1         1.13.5   42s  2024-07-22 13:53.04  
  dapr-placement-server  dapr-system  True     Running  1         1.13.5   42s  2024-07-22 13:53.04  
  dapr-sentry            dapr-system  True     Running  1         1.13.5   42s  2024-07-22 13:53.04  
  dapr-sidecar-injector  dapr-system  True     Running  1         1.13.5   42s  2024-07-22 13:53.04
```

### Step 2 - Configure the Redis Statestore component

Apply the `redis.yaml` file and observe that your state store was successfully configured!

<!-- STEP
name: Deploy redis config
sleep: 1
expected_stdout_lines:

-->

```bash
kubectl apply -f ./deploy/redis.yaml
```
<!-- END_STEP -->


## Using the `kubectl` CLI

### Step 2 - Deploy the Node.js app with the Dapr sidecar

<!-- STEP
name: Deploy Node App
sleep: 70
expected_stdout_lines:
  - "service/nodeapp created"
  - "deployment.apps/nodeapp created"
  - 'deployment "nodeapp" successfully rolled out'
tags:
  - normal-run
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
tags:
  - normal-run
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

### Step 4 - Verify Service

To call the service that you set up port forwarding to, from a command prompt run:

<!-- STEP
name: Curl Test
expected_stdout_lines:
  - '{"DAPR_HTTP_ENDPOINT":"http://localhost:3500","DAPR_GRPC_ENDPOINT":"http://localhost:50001"}'
tags:
  - normal-run
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
tags:
  - normal-run
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
tags:
  - normal-run
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

### Step 5 - Deploy the Python app with the Dapr sidecar

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
tags:
  - normal-run
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

### Step 6 - Observe messages

Now that the Node.js and Python applications are deployed, watch messages come through:

Get the logs of the Node.js app:

<!-- TODO(artursouza): Add "Successfully persisted state for Order ID: X" once the new image is published -->

<!-- STEP
expected_stdout_lines:
  - "Got a new order! Order ID: 11"
  - "Successfully persisted state for Order ID: 11"
expected_stderr_lines:
output_match_mode: substring
match_order: none
name: Read nodeapp logs
tags:
  - normal-run
-->

```bash
kubectl logs --selector=app=node -c node --tail=-1
```

<!-- END_STEP -->

If all went well, you should see logs like this:

```
Got a new order! Order ID: 1
Successfully persisted state for Order ID: 1
Got a new order! Order ID: 2
Successfully persisted state for Order ID: 2
Got a new order! Order ID: 3
Successfully persisted state for Order ID: 3
```

### Step 7 - Observe API call logs

Now that the Node.js and Python applications are deployed, watch API call logs come through:

Get the API call logs of the node app:

<!-- STEP
expected_stdout_lines:
  - 'method="POST /v1.0/state/statestore"'
expected_stderr_lines:
output_match_mode: substring
name: Read nodeapp logs
tags:
  - normal-run
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
tags:
  - normal-run
-->

```bash
kubectl logs --selector=app=python -c daprd --tail=-1
```
<!-- END_STEP -->

```
time="2022-04-27T02:47:49.972688145Z" level=info method="POST /neworder" app_id=pythonapp instance=pythonapp-545df48d55-jvj52 scope=dapr.runtime.http-info type=log ver=1.7.2
time="2022-04-27T02:47:50.984994545Z" level=info method="POST /neworder" app_id=pythonapp instance=pythonapp-545df48d55-jvj52 scope=dapr.runtime.http-info type=log ver=1.7.2
```

### Step 8 - Confirm successful persistence

Call the Node.js app's order endpoint to get the latest order. Grab the external IP address that you saved before and, append "/order" and perform a GET request against it (enter it into your browser, use Postman, or curl it!):

```
curl $NODE_APP/order
{"orderID":"42"}
```

You should see the latest JSON in response!

### Step 9 - Cleanup

Once you're done, you can spin down your Kubernetes resources by navigating to the `./deploy` directory and running:

<!-- STEP
name: "Delete resources from Kubernetes"
working_dir: "./deploy"
sleep: 30
timeout_seconds: 30
expected_stdout_lines:
  - service "nodeapp" deleted
  - deployment.apps "nodeapp" deleted
  - deployment.apps "pythonapp" deleted
  - component.dapr.io "statestore" deleted
output_match_mode: substring
match_order: none
tags:
  - normal-run
-->

```bash
kubectl delete -f .
```
<!-- END_STEP -->

This will spin down each resource defined by the `.yaml` files in the `deploy` directory, including the state component.

  > **Note**: This will also delete the state store component. If the `--dev` flag was used for Dapr init, and you want to use the `dapr-dev-redis` deployment as state store, replace the `redisHost` value inside `./deploy/redis.yaml` with `dapr-dev-redis-master:6379` and also the `secretKeyRef`, `name` with `dapr-dev-redis`. Then run the command `kubectl apply -f ./deploy/redis.yaml`, to apply the file again. This will create a `statestore` Dapr component pointing to `dapr-dev-redis` deployment.

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
