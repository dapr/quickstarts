# Secrets store

This tutorial shows you how to use the Dapr secrets API to access secrets from secret stores. This sample uses a Node application to access a Kubernetes secret store.



## Prerequisites
This sample requires you to have the following installed on your machine:
- [Docker](https://docs.docker.com/)
- [Node.js version 8 or greater](https://nodejs.org/en/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- A Kubernetes cluster, such as [Minikube](https://github.com/dapr/docs/blob/master/getting-started/cluster/setup-minikube.md), [AKS](https://github.com/dapr/docs/blob/master/getting-started/cluster/setup-aks.md)
- [Postman](https://www.getpostman.com/) [Optional]

Also, unless you have already done so, clone the repository with the samples and ````cd```` into the right directory:
```
git clone [-b <dapr_version_tag>] https://github.com/dapr/samples.git
cd samples
```
> **Note**: See https://github.com/dapr/samples#supported-dapr-runtime-version for supported tags. Use `git clone https://github.com/dapr/samples.git` when using the edge version of dapr runtime.
  
## Step 1 - Setup Dapr on your Kubernetes Cluster

The first thing you need is an RBAC enabled Kubernetes cluster. This could be running on your machine using Minikube, or it could be a fully-fledged cluser in Azure using [AKS](https://azure.microsoft.com/en-us/services/kubernetes-service/). 

Once you have a cluster, follow the steps below to deploy Dapr to it. For more details, look [here](https://github.com/dapr/docs/blob/master/getting-started/environment-setup.md#installing-dapr-on-a-kubernetes-cluster)

> Please note, that using the CLI does not support non-default namespaces.  
> If you need a non-default namespace, Helm has to be used (see below).

```
$ dapr init --kubernetes
ℹ️  Note: this installation is recommended for testing purposes. For production environments, please use Helm

⌛  Making the jump to hyperspace...
✅  Deploying the Dapr Operator to your cluster...
✅  Success! Dapr has been installed. To verify, run 'kubectl get pods -w' in your terminal
```

## Step 2 - Configure a Secret in the Secret Store

Dapr can use a number of different secret stores (AWS Secret Manager, Azure Key Vault, GCP Secret Manager, Kubernetes, etc) to retrieve secrets. For this demo, you'll use the [Kubernetes secret store](https://kubernetes.io/docs/concepts/configuration/secret/) (For instructions on other secret stores, please refer to [this documentation](https://github.com/dapr/docs/tree/master/howto/setup-secret-store)).

1. Add your secret to a file ./secret. For example, if your password is "abcd", then the contents of ./secret should be "abcd"
2. Create the secret in the Kubernetes secret store. Note, the name of our secret here is "mysecret" and will be used in a later step.
    ```
    kubectl create secret generic mysecret --from-file ./secret
    ```
3. You can check that the secret is indeed stored in the Kubernetes secret store by running the command:
    ```
    kubectl get secret mysecret -o yaml
    ```
   You can see the output as below where the secret is stored in the secret store in Base64 encoded format
   ```
    % kubectl get secret mysecret -o yaml
        apiVersion: v1
        data:
        secret: eHl6OTg3Ngo=
        kind: Secret
        metadata:
        creationTimestamp: "2020-05-20T20:20:09Z"
        name: mysecret
        namespace: default
        resourceVersion: "2031800"
        selfLink: /api/v1/namespaces/default/secrets/mysecret
        uid: 64c60c3e-dce4-4c02-b5c1-8d4dbb7cbb8f
        type: Opaque
    ```


## Step 3 - Deploy the Node.js App with the Dapr Sidecar

```
kubectl apply -f ./deploy/node.yaml
```

This will deploy our Node.js app to Kubernetes.

You'll also see the container image that is being deployed. If you want to update the code and deploy a new image, see **Next Steps** section. 

This deployment provisions an external IP.
Wait until the IP is visible: (may take a few minutes)

```
kubectl get svc nodeapp
```

> Note: Minikube users cannot see the external IP. Instead, you can use `minikube service [service_name]` to access loadbalancer without external IP.

Once you have an external IP, save it.
You can also export it to a variable:

**Linux/MacOS**:

```
export NODE_APP=$(kubectl get svc nodeapp --output 'jsonpath={.status.loadBalancer.ingress[0].ip}')
```

**Windows**:

```
for /f "delims=" %a in ('kubectl get svc nodeapp --output 'jsonpath={.status.loadBalancer.ingress[0].ip}') do @set NODE_APP=%a
```

## Step 4 - Access the secret
Make a request to the node app to fetch the secret. You can use the command below:
```
curl -k http://$NODE_APP/getsecret 
```
The output should be your base64 encoded secret

## Step 5 - Observe Logs

Now that the node app is running, let's watch messages come through.

Get the logs of the Node.js app:

```
kubectl logs --selector=app=node -c node
```

If all went well, you should see logs like this:

```
% kubectl logs --selector=app=node -c node
Node App listening on port 3000!
Fetching URL: http://localhost:3500/v1.0/secrets/kubernetes/mysecret?metadata.namespace=default
Base64 encoded secret is: eHl6OTg3Ngo=
```

In these logs, you can see that the node app is making a request to dapr to fetch the secret from the secret store. Note: mysecret is the secret that you created in Step 2

## Step 6 - Cleanup

Once you're done using the sample, you can spin down your Kubernetes resources by navigating to the `./deploy` directory and running:

```bash
kubectl delete -f ./deploy/node.yaml
```

This will spin down the node app.

## Next Steps

If you want to update the node app, you can do the following:

1. Update Node code as you see fit!
2. Navigate to the node app directory you want to build a new image for.
3. Run `docker build -t <YOUR_IMAGE_NAME> . `. You can name your image whatever you like. If you're planning on hosting it on docker hub, then it should start with `<YOUR_DOCKERHUB_USERNAME>/`.
4. Once your image has built you can see it on your machines by running `docker images`.
5. To publish your docker image to docker hub (or another registry), first login: `docker login`. Then run`docker push <YOUR IMAGE NAME>`.
6. Update your .yaml file to reflect the new image name.
7. Deploy your updated Dapr enabled app: `kubectl apply -f node.yaml`.


## Related Links
- [Secret store overview](https://kubernetes.io/docs/concepts/configuration/secret/)
- [Secret store API reference](https://github.com/dapr/docs/blob/master/reference/api/secrets_api.md)
- [Setup a secret store](https://github.com/dapr/docs/blob/master/howto/setup-secret-store/README.md)
- [Code snippets in different programming languages](https://github.com/dapr/docs/blob/master/howto/get-secrets/README.md)
