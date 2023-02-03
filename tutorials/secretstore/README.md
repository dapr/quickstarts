# Secrets store

This tutorial shows you how to use the Dapr secrets API to access secrets from secret stores. Dapr allows us to deploy the same microservice from the local machines to Kubernetes. Correspondingly, this quickstart has instructions for deploying this project [locally](#Run-Locally) or in [Kubernetes](#Run-in-Kubernetes).


## Prerequisites


### Prerequisites to run Locally 
- [Dapr CLI with Dapr initialized](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [Node.js version 14 or greater](https://nodejs.org/en/)
- [Postman](https://www.getpostman.com/) [Optional]

### Prerequisites to run in Kubernetes

This quickstart requires you to have the following installed on your machine:
- [Docker](https://docs.docker.com/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- A Kubernetes cluster, such as [Minikube](https://docs.dapr.io/operations/hosting/kubernetes/cluster/setup-minikube/), [AKS](https://docs.dapr.io/operations/hosting/kubernetes/cluster/setup-aks/)

Also, unless you have already done so, clone the repository with the quickstarts and ````cd```` into the right directory:
```
git clone [-b <dapr_version_tag>] https://github.com/dapr/quickstarts.git
cd quickstarts
```
> **Note**: See https://github.com/dapr/quickstarts#supported-dapr-runtime-version for supported tags. Use `git clone https://github.com/dapr/quickstarts.git` when using the edge version of dapr runtime.
  
## Run Locally

### Step 1 - Setup Dapr on your local machine

Follow [instructions](https://docs.dapr.io/getting-started/install-dapr-cli/) to download and install the Dapr CLI and initialize Dapr.

### Step 2 - Understand the code and configuration

Navigate to the secretstore quickstart and the node folder within that location. 

```bash
cd secretstore/node
```

In the `app.js` you'll find a simple `express` application, which exposes a few routes and handlers. First, take a look at the top of the file: 

```js
const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const secretStoreName = process.env.SECRET_STORE; 
const secretName = 'mysecret'
```

The `secretStoreName` is read from an environment variable where the value `kubernetes` is injected for a Kubernetes deployment and for local development the environment variable must be set to `localsecretstore` value.

Next take a look at the `getsecret` handler: 

```js
app.get('/getsecret', (_req, res) => {
    const url = `${secretsUrl}/${secretStoreName}/${secretName}?metadata.namespace=default`
    console.log("Fetching URL: %s", url)
    fetch(url)
    .then(res => res.json())
    .then(json => {
        let secretBuffer = new Buffer(json["mysecret"])
        let encodedSecret = secretBuffer.toString('base64')
        console.log("Base64 encoded secret is: %s", encodedSecret)
        return res.send(encodedSecret)
    })
});
```

The code gets the the secret called `mysecret` from the secret store and displays a Base64 encoded version of the secret.

In `secrets.json` file, you'll find a secret `mysecret`.

```json
{
    "mysecret": "abcd"
}
```

In the components folder, there is a `local-secret-store.yaml`  which defines a local file secret store component to be used by Dapr. 


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localsecretstore
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: secrets.json
  - name: nestedSeparator
    value: ":"
```

The component defines a local secret store with the secrets file path as the `secrets.json` file.

> Note: You can also use a local secret store that uses [environment variables](https://docs.dapr.io/operations/components/setup-secret-store/supported-secret-stores/envvar-secret-store/) for secrets instead of a [local file](https://docs.dapr.io/operations/components/setup-secret-store/supported-secret-stores/file-secret-store/).

### Step 3 - Export Secret Store name and run Node.js app with Dapr

Export Secret Store name as environment variable:

```
Linux/Mac OS:
export SECRET_STORE="localsecretstore"

Windows:
set SECRET_STORE=localsecretstore
```

Install dependencies 

<!-- STEP
name: "npm install"
working_dir: node
-->

```bash
npm install
```

<!-- END_STEP -->

Run Node.js app with Dapr with the local secret store component: 

<!-- STEP
expected_stdout_lines:
  - "You're up and running! Both Dapr and your app logs will appear here."
  - "== APP == Fetching URL: http://localhost:3500/v1.0/secrets/localsecretstore/mysecret?metadata.namespace=default"
  - "== APP == Base64 encoded secret is: YWJjZA=="
  - "Exited Dapr successfully"
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
working_dir: node
name: Run node app
background: true
sleep: 5
env:
  SECRET_STORE: "localsecretstore"
-->

```bash
dapr run --app-id nodeapp --resources-path ./components --app-port 3000 --dapr-http-port 3500 node app.js
```

<!-- END_STEP -->

The command starts the Dapr application and finally after it is completely initialized, you should see the logs 

```
Updating metadata for app command: node app.js
✅  You're up and running! Both Dapr and your app logs will appear here.
```

### Step 4 - Access the secret

Make a request to the node app to fetch the secret. You can use the command below:

<!-- STEP
name: "Curl validate"
expected_stdout_lines:
  - YWJjZA==
-->

```bash
curl -k http://localhost:3000/getsecret 
```

<!-- END_STEP -->

The output should be your base64 encoded secret `YWJjZA==`

### Step 5 - Observe the logs of the app

The application logs should be similar to the following: 
```
== APP == Fetching URL: http://localhost:3500/v1.0/secrets/localsecretstore/mysecret?metadata.namespace=default

== APP == Base64 encoded secret is: YWJjZA==
```

### Step 6 - Cleanup

To stop your services from running, simply stop the "dapr run" process. Alternatively, you can spin down each of your services with the Dapr CLI "stop" command. For example, to spin down both services, run these commands in a new command line terminal: 

<!-- STEP
output_match_mode: substring
expected_stdout_lines: 
  - 'app stopped successfully: nodeapp'
name: Shutdown dapr
-->

```bash
dapr stop --app-id nodeapp
```

<!-- END_STEP -->

To see that services have stopped running, run `dapr list`, noting that your service no longer appears!

## Run in Kubernetes

### Step 1 - Setup Dapr on your Kubernetes cluster

The first thing you need is an RBAC enabled Kubernetes cluster. This could be running on your machine using Minikube, or it could be a fully-fledged cluser in Azure using [AKS](https://azure.microsoft.com/en-us/services/kubernetes-service/). 

Once you have a cluster, follow the steps below to deploy Dapr to it. For more details, see [Deploy Dapr on a Kubernetes cluster](https://docs.dapr.io/operations/hosting/kubernetes/kubernetes-deploy/).

> Please note, the CLI will install to the dapr-system namespace by default. If this namespace does not exist, the CLI will create it.
> If you need to deploy to a different namespace, you can use ```-n mynamespace```.

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

> Without the ```--wait``` flag the Dapr CLI will exit as soon as the kubernetes deployments are created. Kubernetes deployments are asyncronous by default, so we use ```--wait``` here to make sure the dapr control plane is completely deployed and running before continuing.

### Step 2 - Configure a secret in the secret store

Dapr can use a number of different secret stores (AWS Secret Manager, Azure Key Vault, GCP Secret Manager, Kubernetes, etc) to retrieve secrets. For this demo, you'll use the [Kubernetes secret store](https://kubernetes.io/docs/concepts/configuration/secret/) (For instructions on other secret stores, please refer to [this documentation](https://docs.dapr.io/developing-applications/building-blocks/secrets/howto-secrets/)).

1. Add your secret to a file `./mysecret`. For example, if your password is "abcd", then the contents of `./mysecret` should be "abcd"

> Note: For Windows make sure the file does not contain an extension as the name of the file becomes the metadata key to retrieve the secret.
2. Create the secret in the Kubernetes secret store. Note, the name of the secret here is "mysecret" and will be used in a later step.

<!-- STEP
name: Create secret
working_dir: node
expected_stdout_lines:
-->

```bash
kubectl create secret generic mysecret --from-file ./mysecret
```

<!-- END_STEP -->

3. You can check that the secret is indeed stored in the Kubernetes secret store by running the command:
```
kubectl get secret mysecret -o yaml
```
   You can see the output as below where the secret is stored in the secret store in Base64 encoded format
```
% kubectl get secret mysecret -o yaml
apiVersion: v1
data:
  mysecret: U0dmQXAzcUc5Qg==
kind: Secret
metadata:
  creationTimestamp: "2020-09-30T17:33:12Z"
  managedFields:
  - apiVersion: v1
    fieldsType: FieldsV1
    fieldsV1:
      f:data:
        .: {}
        f:mysecret: {}
      f:type: {}
    manager: kubectl-create
    operation: Update
    time: "2020-09-30T17:33:12Z"
  name: mysecret
  namespace: default
  resourceVersion: "6617"
  selfLink: /api/v1/namespaces/default/secrets/mysecret
  uid: 4734ad91-0863-4dec-a200-5e191b8cab20
type: Opaque
```


### Step 3 - Deploy the Node.js app with the Dapr sidecar

<!-- STEP
name: Deploy to k8s
expected_stdout_lines:
  - "deployment.apps/nodeapp created"
  - 'deployment "nodeapp" successfully rolled out'
-->

```bash
kubectl apply -f deploy/node.yaml
```

Kubernetes deployments are asyncronous. This means you'll need to wait for the deployment to complete before moving on to the next steps. You can do so with the following command:

```bash
kubectl rollout status deploy/nodeapp
```

<!-- END_STEP -->


There are several different ways to access a Kubernetes service depending on which platform you are using. Port forwarding is one consistent way to access a service, whether it is hosted locally or on a cloud Kubernetes provider like AKS.

<!-- STEP
name: Port forward
background: true
sleep: 2
timeout_seconds: 10
expected_return_code:
-->

```bash
kubectl port-forward service/nodeapp 8000:80
```

<!-- END_STEP -->

This will make your service available on http://localhost:8000.

> **Optional**: If you are using a public cloud provider, you can substitue your EXTERNAL-IP address instead of port forwarding. You can find it with:

```bash 
kubectl get svc nodeapp
```


### Step 4 - Access the secret
Make a request to the node app to fetch the secret. You can use the command below:

<!-- STEP
name: Curl test
expected_stdout_lines:
  - "eHl6OTg3Ng=="
-->

```bash
curl -k http://localhost:8000/getsecret 
```

<!-- END_STEP -->

The output should be your base64 encoded secret

### Step 5 - Observe Logs

Now that the node app is running, watch messages come through.

Get the logs of the Node.js app:

<!-- STEP
name: Read logs
expected_stdout_lines:
  - 'Node App listening on port 3000!'
  - 'Fetching URL: http://localhost:3500/v1.0/secrets/kubernetes/mysecret?metadata.namespace=default'
  - 'Base64 encoded secret is: eHl6OTg3Ng=='
-->

```bash
kubectl logs --selector=app=node -c node
```

<!-- END_STEP -->

If all went well, you should see logs like this:

```
Node App listening on port 3000!
Fetching URL: http://localhost:3500/v1.0/secrets/kubernetes/mysecret?metadata.namespace=default
Base64 encoded secret is: eHl6OTg3Ng==
```

In these logs, you can see that the node app is making a request to dapr to fetch the secret from the secret store. Note: mysecret is the secret that you created in Step 2

### Step 6 - Cleanup

Once you're done, you can spin down your Kubernetes resources by navigating to the `./deploy` directory and running:

<!-- STEP
name: Cleanup
expected_stdout_lines:
  - 'service "nodeapp" deleted'
  - 'deployment.apps "nodeapp" deleted'
  - 'secret "mysecret" deleted'
-->

```bash
kubectl delete -f ./deploy/node.yaml
```

```bash
kubectl delete secret mysecret
```

<!-- END_STEP -->

This will spin down the node app.

### Updating the Node application and deploying in Kubernetes

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
- [Secret store API reference](https://docs.dapr.io/reference/api/secrets_api/)
- [Setup a secret store](https://docs.dapr.io/developing-applications/building-blocks/secrets/howto-secrets/)

## Next steps:

- Explore additional [quickstarts](../../README.md#quickstarts)
