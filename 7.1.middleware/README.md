# OAuth Authorization (non interactive)

This tutorial walks you through the steps of setting up the OAuth middleware to enable ... TODO

![Architecture Diagram](some diagram)

> **NOTE**: This sample uses Microsoft Identity Platform/Azure Active Directory and Microsoft Graph Account as an example. 

## Prerequisites

- [Dapr enabled Kubernetes cluster](https://github.com/dapr/docs/blob/master/getting-started/environment-setup.md#installing-dapr-on-a-kubernetes-cluster)
- [Node.js version 8 or greater](https://nodejs.org/en/)
- [Docker](https://docs.docker.com/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Helm](https://github.com/helm/helm)
- A working [Azure Active Directory] with Administrator rights<TODO>(https://TODO)


## Step 1 - Clone the sample repository

1. Clone the sample repo, then navigate to the middleware sample:
```bash
git clone [-b <dapr_version_tag>] https://github.com/dapr/samples.git
cd samples/7.1.middleware/msgraphapp
```
> **Note**: See https://github.com/dapr/samples#supported-dapr-runtime-version for supported tags. Use `git clone https://github.com/dapr/samples.git` when using the edge version of dapr runtime.
1. Examine the ```app.js``` file. You'll see this is a simple Node.js Express web server with a single ```/users``` route that returns the Microsoft Graph API result:

```javascript

```

## Step 2 - Register your application with the authorization server

In order for Dapr to acquire access token on your application's behalf, your application needs to be registered with an Azure Active Directory.


  
> **NOTE:** For this exercise, you'll set the ```Redirect URL``` to ```http://dummy.com```. This requires you to add a hostname entry to the computer on which you'll test out the scenario. In a production environment, you need to set the ```Redirect URL``` to the proper DNS name associated with your load balancer or ingress controller.


## Step 3 - Define custom pipeline

To define a custom pipeline with the OAuth middleware, you need to create a middleware component definition as well as a configuration that defines the custom pipeline.

1. Edit ```deploy\oauth2clientcredentials.yaml``` file to enter your ```Client ID``` and ```Client Secret```, ```Token URL```. You can leave everything else unchanged.
2. Change the directory to root and apply the manifests - ```oauth2clientcredentials.yaml``` defines the OAuth middleware and ```msgraphpipeline.yaml``` defines the custom pipeline:
```bash
cd ..
kubectl apply -f deploy/oauth2clientcredentials.yaml
kubectl apply -f deploy/msgraphpipeline.yaml
```

## Step 4 - Deploy the application
Next, you'll deploy the application and define an ingress rule that routes to the ```-dapr``` service that gets automatically created when you deploy your pod. In this case, we are routing all traffic to the Dapr sidecar, which can reinforce various policies through middleware.

1. Deploy the application:
```bash
kubectl apply -f deploy/msgraphapp.yaml
```

TODO log in to container

## Step 5 - Test

1. Add a hostname entry to your local hosts file(`/etc/hosts` in linux and `c:\windows\system32\drivers\etc\hosts` in windows) to allow the ```dummy.com``` to be resolved to the public IP associated with your ingress controller:

```bash
<External IP of your ingress controller> dummy.com
```

2. Open a browser and try to invoke the ```/echo``` API through Dapr:

```
http://dummy.com/v1.0/invoke/echoapp/method/echo?text=hello
```
3. If you haven't logged on to Google, you'll be redirected to the login page. Then, you'll be redirected to the consent screen to confirm access.

4. The browser redirects back to your application with the access token extracted from a (configurable) ```authorization``` header:

![Web Page](./img/webpage.png)

## Step 6 - Cleanup

1. Spin down kunernetes resources:
```bash
kubectl delete -f deploy/.
```
2. Delete the credential created in the AAD.