# Dapr Bindings

In this quickstart, you'll create two microservices, one with an input binding and another with an output binding. You'll bind to Kafka, but note that there are a myriad of components that Dapr can bind to ([see Dapr components](https://docs.dapr.io/concepts/components-concept/)). 

This quickstart includes two microservices:

- Node.js microservice that utilizes an input binding
- Python microservice that utilizes an output binding

The bindings connect to Kafka, allowing us to push messages into a Kafka instance (from the Python microservice) and receive message from that instance (from the Node microservice) without having to know where the instance is hosted. Instead, connect through the sidecars using the Dapr API. See architecture diagram to see how the components interconnect locally:

![Architecture Diagram](./img/Bindings_Standalone.png)


Dapr allows us to deploy the same microservices from the local machines to Kubernetes. Correspondingly, this quickstart has instructions for deploying this project [locally](#Run-Locally) or in [Kubernetes](#Run-in-Kubernetes).

## Prerequisites

### Prerequisites to Run Locally

- [Dapr CLI with Dapr initialized](https://docs.dapr.io/getting-started/install-dapr-cli/)
- [Node.js version 14 or greater](https://nodejs.org/en/)
- [Python 3.4 or greater](https://www.python.org/)

### Prerequisites to Run in Kubernetes

- [Dapr enabled Kubernetes cluster](https://docs.dapr.io/operations/hosting/kubernetes/kubernetes-deploy/)

## Run Locally

### Clone the quickstarts repository
Clone this quickstarts repository to your local machine:

```bash
git clone [-b <dapr_version_tag>] https://github.com/dapr/quickstarts.git
```

>**Note**: See https://github.com/dapr/quickstarts#supported-dapr-runtime-version for supported tags. Use `git clone https://github.com/dapr/quickstarts.git` when using the edge version of dapr runtime.

### Run Kafka Docker Container Locally

In order to run the Kafka bindings quickstart locally, you will run the [Kafka broker server](https://github.com/wurstmeister/kafka-docker) in a docker container on your machine.

1. To run the container locally, run:

<!-- STEP
name: Install Kafka
sleep: 20
-->

```bash
docker-compose -f ./docker-compose-single-kafka.yml up -d
```

2. To see the container running locally, run:

```bash
docker ps
```

<!-- END_STEP -->

The output should be similar to this:

```bash
342d3522ca14        kafka-docker_kafka                      "start-kafka.sh"         14 hours ago        Up About
a minute   0.0.0.0:9092->9092/tcp                               kafka-docker_kafka_1
0cd69dbe5e65        wurstmeister/zookeeper                  "/bin/sh -c '/usr/sb…"   8 days ago          Up About
a minute   22/tcp, 2888/tcp, 3888/tcp, 0.0.0.0:2181->2181/tcp   kafka-docker_zookeeper_1
```

### Run Node Microservice with Input Binding

Now that you have Kafka running locally on your machine, you'll need to run the microservices. You'll start by running the Node microservice that uses input bindings:

1. Navigate to Node subscriber directory in your CLI: 


```bash
cd nodeapp
```

2. Install dependencies:

<!-- STEP
name: Install npm dependencies
working_dir: ./nodeapp
-->

```bash
npm install
```

<!-- END_STEP -->

3. Run Node quickstart app with Dapr: 

<!-- STEP
name: Run node app
working_dir: ./nodeapp
background: true
sleep: 5
output_match_mode: substring
expected_stdout_lines: 
  - "You're up and running! Both Dapr and your app logs will appear here."
  - "== APP == Hello from Kafka!"
  - "== APP == { orderId:"
  - "== APP == Hello from Kafka!"
  - "== APP == { orderId:"
  - "== APP == Hello from Kafka!"
  - "== APP == { orderId:"
  - "== APP == Hello from Kafka!"
  - "Exited Dapr successfully"
  - "Exited App successfully"
-->

```bash
dapr run --app-id bindings-nodeapp --app-port 3000 node app.js --resources-path ../components
```

<!-- END_STEP -->

### Run Python Microservice with Output Binding

Next, run the Python microservice that uses output bindings

1. Open a new CLI window and navigate to Python subscriber directory in your CLI: 

```bash
cd pythonapp
```

2. Install dependencies:

<!-- STEP
name: Install python dependencies
working_dir: ./pythonapp
-->

```bash
pip3 install requests
```

<!-- END_STEP -->

3. Run Python quickstart app with Dapr: 

<!-- STEP
name: Run node app
working_dir: ./pythonapp
background: true
sleep: 25
output_match_mode: substring
expected_stdout_lines: 
  - "You're up and running! Both Dapr and your app logs will appear here."
  - "== APP == {'data': {'orderId': 1}, 'operation': 'create'}"
  - "== APP == Response for order 1: 204"
  - "== APP == {'data': {'orderId': 2}, 'operation': 'create'}"
  - "== APP == Response for order 2: 204"
  - "== APP == {'data': {'orderId': 3}, 'operation': 'create'}"
  - "== APP == Response for order 3: 204"
  - "Exited Dapr successfully"
  - "Exited App successfully"
-->

```bash
dapr run --app-id bindings-pythonapp python3 app.py --resources-path ../components
```

<!-- END_STEP -->

### Observe Logs

1. Observe the Python logs, which show a successful output binding with Kafka:

```bash
[0m?[94;1m== APP == {'data': {'orderId': 1}}
[0m?[94;1m== APP == Response for order 1: 204
[0m?[94;1m== APP == {'data': {'orderId': 2}}
[0m?[94;1m== APP == Response for order 2: 204
[0m?[94;1m== APP == {'data': {'orderId': 3}}
[0m?[94;1m== APP == Response for order 3: 204
```

2. Observe the Node logs, which show a successful input binding with Kafka: 

```bash
[0m?[94;1m== APP == { orderId: 1 }
[0m?[94;1m== APP == Hello from Kafka!
[0m?[94;1m== APP == { orderId: 2 }
[0m?[94;1m== APP == Hello from Kafka!
[0m?[94;1m== APP == { orderId: 3 }
[0m?[94;1m== APP == Hello from Kafka!
```

### Cleanup

To cleanly stop the dapr microservices, run:

<!-- STEP
output_match_mode: substring
expected_stdout_lines: 
  - 'app stopped successfully: bindings-nodeapp'
  - 'app stopped successfully: bindings-pythonapp'
expected_stderr_lines:
name: Shutdown Dapr and Kafka
-->

```bash
dapr stop --app-id bindings-nodeapp
```

```bash
dapr stop --app-id bindings-pythonapp
```

Once you're done, you can spin down your local Kafka Docker Container by running:

```bash
docker-compose -f ./docker-compose-single-kafka.yml down
```

<!-- END_STEP -->

## Run in Kubernetes

### Setting up a Kafka in Kubernetes

1. Install Kafka via [bitnami/kafka](https://bitnami.com/stack/kafka/helm)


<!-- STEP
name: Install Kafka
sleep: 15
timeout_seconds: 300
-->

```bash
helm repo add bitnami https://charts.bitnami.com/bitnami
```

```bash
helm repo update
```

```bash
kubectl create ns kafka
```

```bash
helm install dapr-kafka bitnami/kafka --wait --namespace kafka -f ./kafka-non-persistence.yaml
```

<!-- END_STEP -->

2. Wait until kafka pods are running

```bash
kubectl -n kafka get pods -w

NAME                     READY   STATUS    RESTARTS   AGE
dapr-kafka-0             1/1     Running   0          2m7s
dapr-kafka-zookeeper-0   1/1     Running   0          2m57s
```

### Deploy Assets

Now that the Kafka binding is set up, deploy the assets.

1. In your CLI window, in the bindings directory run: 

<!-- STEP
name: Run kubernetes apps
sleep: 30
expected_stdout_lines: 
  - component.dapr.io/sample-topic created
  - service/bindings-nodeapp created
  - deployment.apps/bindings-nodeapp created
  - deployment.apps/bindings-pythonapp created
  - 'deployment "bindings-nodeapp" successfully rolled out'
  - 'deployment "bindings-pythonapp" successfully rolled out'
-->

```bash
kubectl apply -f ./deploy
```

This will deploy bindings-nodeapp and bindings-pythonapp microservices. It will also apply the Kafka bindings component configuration you set up in the last step.

Kubernetes deployments are asyncronous. This means you'll need to wait for the deployment to complete before moving on to the next steps. You can do so with the following command:

```bash
kubectl rollout status deploy/bindings-nodeapp
```

```bash
kubectl rollout status deploy/bindings-pythonapp
```

<!-- END_STEP -->

2. Run `kubectl get pods` to see that pods were correctly provisioned.

### Observe Logs

1. Observe the Python app logs, which show a successful output binding with Kafka:

```bash
kubectl get pods
```

The output should look like this:

```bash
NAME                                    READY   STATUS        RESTARTS   AGE
bindings-nodeapp-699489b8b6-mqhrj       2/2     Running       0          4s
bindings-pythonapp-644489969b-c8lg5     2/2     Running       0          4m9s
```

Look at the Python app logs by running:

<!-- STEP
name: Read Python Logs
output_match_mode: substring
expected_stdout_lines:
  - "{'data': {'orderId': " 
  - "{'data': {'orderId': "
  - "<Response [204]>"
-->

```bash
kubectl logs --selector app=bindingspythonapp -c python --tail=-1
```

<!-- END_STEP -->

```bash
...
{'data': {'orderId': 10}, 'operation': 'create'}
<Response [204]>
{'data': {'orderId': 11}, 'operation': 'create'}
<Response [204]>
...
```

2. Observe the Node app logs, which show a successful input bining with Kafka: 

```bash
kubectl get pods
```

The output should look like this:

```bash
NAME                                    READY   STATUS        RESTARTS   AGE
bindings-nodeapp-699489b8b6-mqhrj       2/2     Running       0          4s
bindings-pythonapp-644489969b-c8lg5     2/2     Running       0          4m9s
```

Look at the Node app logs by running:

<!-- STEP
name: Read Node Logs
output_match_mode: substring
expected_stdout_lines:
  - Hello from Kafka!
  - "{ orderId: "
  - Hello from Kafka!
  - "{ orderId: "
-->

```bash
kubectl logs --selector app=bindingsnodeapp -c node --tail=-1
```

<!-- END_STEP -->

The output should look like this:

```bash
Node App listening on port 3000!
...
Hello from Kafka!
{ orderId: 240 }
Hello from Kafka!
{ orderId: 241 }
...
```

### Cleanup

Once you're done, you can spin down your Kubernetes resources by running:

<!-- STEP
name: Cleanup
expected_stdout_lines:
-->

```bash
kubectl delete -f ./deploy
```

This will spin down each resource defined by the .yaml files in the `deploy` directory, including the kafka component.

Once you delete all quickstart apps, delete Kafka in the cluster.

```bash
helm uninstall dapr-kafka --namespace kafka
```

And finally, you can delete the kafka namespace

```bash
kubectl delete ns kafka
```

<!-- END_STEP -->

## How it Works

Now that you've run the quickstart locally and/or in Kubernetes, let's unpack how this all works. The app is broken up into input binding app and output binding app:

### Kafka Bindings yaml

Before looking at the application code, let's see the Kafka bindings component yamls([local](./components/kafka_bindings.yaml), and [Kubernetes](./deploy/kafka_bindings.yaml)), which specify `brokers` for Kafka connection, `topics` and `consumerGroup` for consumer, and `publishTopic` for publisher topic.

> See the howtos in [references](#references) for the details on input and output bindings


This configuration yaml creates `sample-topic` component to set up Kafka input and output bindings through the Kafka `sample` topic. 

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sample-topic
spec:
  type: bindings.kafka
  version: v1
  metadata:
  # Kafka broker connection setting
  - name: brokers
    value: [kafka broker address]
  # consumer configuration: topic and consumer group
  - name: topics
    value: sample
  - name: consumerGroup
    value: group1
  # publisher configuration: topic
  - name: publishTopic
    value: sample
  - name: authRequired
    value: "false"
```

### Node Input binding app

Navigate to the `nodeapp` directory and open `app.js`, the code for the Node.js input bindings sample app. Here you're exposing one API endpoint using `express`. The API name must be identical to the component name which is specified in Kafka bindings component yaml. Then Dapr runtime will consume the event from `sample` topic and then send the POST request to Node app with the event payload.

```js
app.post('/sample-topic', (req, res) => {
    console.log("Hello from Kafka!");
    console.log(req.body);
    res.status(200).send();
});
```

### Python Output binding app

Navigate to the `pythonapp` directory and open `app.py`, the code for the output bindings sample app. This sends POST request to Dapr http endpoint `http://localhost:3500/v1.0/bindings/<output_bindings_name>` with the event payload every second. This app uses `sample-topic` bindings component name as `<output_bindings_name>`. Then Dapr runtime will send the event to `sample` topic which is specified in the above Kafka bindings component yaml.

```python
dapr_url = "http://localhost:{}/v1.0/bindings/sample-topic".format(dapr_port)
n = 0
while True:
    n += 1
    payload = { "data": {"orderId": n}, "operation": "create" }
    print(payload, flush=True)
    try:
        response = requests.post(dapr_url, json=payload)
        print(response.text, flush=True)

    except Exception as e:
        print(e)

    time.sleep(1)
```

## Related links

- Learn more about bindings in the [Dapr docs](https://docs.dapr.io/developing-applications/building-blocks/bindings/)
- How to [create an event-driven app using input bindings](https://docs.dapr.io/developing-applications/building-blocks/bindings/howto-triggers/)
- How to [send events to external systems using Output Bindings](https://docs.dapr.io/developing-applications/building-blocks/bindings/howto-bindings/)

## Next Steps

- Explore additional [quickstarts](../../README.md#quickstarts).
