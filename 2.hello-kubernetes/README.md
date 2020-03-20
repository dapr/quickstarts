# Hello Kubernetes

This tutorial will get you up and running with Dapr in a Kubernetes cluster. We'll be deploying the same applications from [Hello World](../1.hello-world). To recap, the Python App generates messages and the Node app consumes and persists them. The following architecture diagram illustrates the components that make up this sample: 

![Architecture Diagram](./img/Architecture_Diagram.png)


## Prerequisites
This sample requires you to have the following installed on your machine:
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- A Kubernetes cluster, such as [Minikube](https://github.com/dapr/docs/blob/master/getting-started/environment-setup.md#setup-cluster), [AKS](https://github.com/dapr/docs/blob/master/getting-started/environment-setup.md#setup-cluster) or [GKE](https://cloud.google.com/kubernetes-engine/)

Also, unless you have already done so, clone the repository with the samples and ````cd```` into the right directory:
```
git clone https://github.com/dapr/samples.git
cd samples
```
  
## Step 1 - Setup Dapr on your Kubernetes Cluster

The first thing you need is an RBAC enabled Kubernetes cluster. This could be running on your machine using Minikube, or it could be a fully-fledged cluser in Azure using [AKS](https://azure.microsoft.com/en-us/services/kubernetes-service/). 

Once you have a cluster, follow the steps below to deploy Dapr to it. For more details, look [here](https://github.com/dapr/docs/blob/master/getting-started/environment-setup.md#installing-dapr-on-a-kubernetes-cluster)

```
$ dapr init --kubernetes
ℹ️  Note: this installation is recommended for testing purposes. For production environments, please use Helm

⌛  Making the jump to hyperspace...
✅  Deploying the Dapr Operator to your cluster...
✅  Success! Dapr has been installed. To verify, run 'kubectl get pods -w' in your terminal
```

## Step 2 - Create and Configure a State Store

Dapr can use a number of different state stores (Redis, CosmosDB, DynamoDB, Cassandra, etc) to persist and retrieve state. For this demo, we'll use Redis.

1. Follow [these steps](https://github.com/dapr/docs/blob/master/howto/configure-redis/README.md) to create a Redis store.
2. Once your store is created, add the keys to the `redis.yaml` file in the `deploy` directory. 
    > **Note:** the `redis.yaml` file provided in this sample takes plain text secrets. In a production-grade application, follow [secret management](https://github.com/dapr/docs/blob/master/concepts/secrets/) instructions to securely manage your secrets.
3. Apply the `redis.yaml` file: `kubectl apply -f ./deploy/redis.yaml` and observe that your state store was successfully configured!

```bash
component.dapr.io "statestore" configured
```

## Step 3 - Deploy the Node.js App with the Dapr Sidecar

```
kubectl apply -f ./deploy/node.yaml
```

This will deploy our Node.js app to Kubernetes. The Dapr control plane will automatically inject the Dapr sidecar to our Pod. If you take a look at the ```node.yaml``` file, you will see how Dapr is enabled for that deployment:

```dapr.io/enabled: true``` - this tells the Dapr control plane to inject a sidecar to this deployment.

```dapr.io/id: nodeapp``` - this assigns a unique id or name to the Dapr application, so it can be sent messages to and communicated with by other Dapr apps.

You'll also see the container image that we're deploying. If you want to update the code and deploy a new image, see **Next Steps** section. 

This deployment provisions an External IP.
Wait until the IP is visible: (may take a few minutes)

```
kubectl get svc nodeapp
```

> Note: Minikube users cannot see the external IP. Instead, you can use `minikube service [service_name]` to access loadbalancer without external IP.

Once you have an external IP, save it.
You can also export it to a variable:

```
export NODE_APP=$(kubectl get svc nodeapp --output 'jsonpath={.status.loadBalancer.ingress[0].ip}')
```

## Step 4 - Deploy the Python App with the Dapr Sidecar
Next, let's take a quick look at our python app. Navigate to the python app in the kubernetes sample: `cd samples/1.hello-world` and open `app.py`.

At a quick glance, this is a basic python app that posts JSON messages to `localhost:3500`, which is the default listening port for Dapr. We invoke our Node.js application's `neworder` endpoint by posting to `v1.0/invoke/nodeapp/method/neworder`. Our message contains some `data` with an orderId that increments once per second:

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

Let's deploy the python app to your Kubernetes cluster:
```
kubectl apply -f ./deploy/python.yaml
```

Now let's just wait for the pod to be in ```Running``` state:

```
kubectl get pods --selector=app=python -w
```

## Step 5 - Observe Messages

Now that we have our Node.js and python applications deployed, let's watch messages come through.

Get the logs of our Node.js app:

```
kubectl logs --selector=app=node -c node
```

If all went well, you should see logs like this:

```
Got a new order! Order ID: 1
Successfully persisted state
Got a new order! Order ID: 2
Successfully persisted state
Got a new order! Order ID: 3
Successfully persisted state
```

## Step 6 - Confirm Successful Persistence

Hit the Node.js app's order endpoint to get the latest order. Grab the external IP address that we saved before and, append "/order" and perform a GET request against it (enter it into your browser, use Postman, or curl it!):

```
curl $NODE_APP/order
{"orderID":"42"}
```

You should see the latest JSON in response!

## Step 7 - Cleanup

Once you're done using the sample, you can spin down your Kubernetes resources by navigating to the `./deploy` directory and running:

```bash
kubectl delete -f .
```

This will spin down each resource defined by the .yaml files in the `deploy` directory, including the state component.

## Next Steps

Now that you're successfully working with Dapr, you probably want to update the sample code to fit your scenario. The Node.js and Python apps that make up this sample are deployed from container images hosted on a private [Azure Container Registry](https://azure.microsoft.com/en-us/services/container-registry/). To create new images with updated code, you'll first need to install docker on your machine. Next, follow these steps:

1. Update Node or Python code as you see fit!
2. Navigate to the directory of the app you want to build a new image for.
3. Run `docker build -t <YOUR_IMAGE_NAME> . `. You can name your image whatever you like. If you're planning on hosting it on docker hub, then it should start with `<YOUR_DOCKERHUB_USERNAME>/`.
4. Once your image has built you can see it on your machines by running `docker images`.
5. To publish your docker image to docker hub (or another registry), first login: `docker login`. Then run`docker push <YOUR IMAGE NAME>`.
6. Update your .yaml file to reflect the new image name.
7. Deploy your updated Dapr enabled app: `kubectl apply -f <YOUR APP NAME>.yaml`.
