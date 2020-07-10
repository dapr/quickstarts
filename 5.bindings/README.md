# Dapr Bindings Sample

In this sample, we'll create two microservices, one with an input binding and another with an output binding. We'll bind to Kafka, but note that there are a myriad of components that Dapr can bind to ([see Dapr components](https://github.com/dapr/docs/tree/master/concepts/bindings)). 

This sample includes two microservices:
- Node.js microservice that utilizes an input binding
- Python microservice that utilizes an output binding

The bindings connect to Kafka, allowing us to push messages into a Kafka instance (from our Python microservice) and receive message from that instance (from our Node microservice) without having to know where the instance is hosted. Instead, we connect through our sidecars using the Dapr API. See architecture diagram to see how our components interconnect locally:

![Architecture Diagram](./img/Bindings_Standalone.png)


Dapr allows us to deploy the same microservices from our local machines to Kubernetes. Correspondingly, this sample has instructions for deploying this project [locally](#Run-Locally) or in [Kubernetes](#Run-in-Kubernetes).

## Prerequisites

### Prerequisites to Run Locally

- [Dapr CLI with Dapr initialized](https://github.com/dapr/docs/tree/master/getting-started)
- [Node.js version 8 or greater](https://nodejs.org/en/)
- [Python 3.4 or greater](https://www.python.org/)

### Prerequisites to Run in Kubernetes

- [Dapr enabled Kubernetes cluster](https://github.com/dapr/docs/blob/master/getting-started/environment-setup.md#installing-dapr-on-a-kubernetes-cluster)

## Run Locally

### Clone the sample repository
Clone this sample repository to your local machine:
```bash
git clone -b <dapr_version_tag> https://github.com/dapr/samples.git
```

### Run Kafka Docker Container Locally

In order to run the Kafka bindings sample locally, you will run the [Kafka broker server](https://github.com/wurstmeister/kafka-docker) in a docker container on your machine.

1. Run `docker-compose -f ./docker-compose-single-kafka.yml up -d` to run the container locally
2. Run `docker ps` to see the container running locally: 

```bash
342d3522ca14        kafka-docker_kafka                      "start-kafka.sh"         14 hours ago        Up About
a minute   0.0.0.0:9092->9092/tcp                               kafka-docker_kafka_1
0cd69dbe5e65        wurstmeister/zookeeper                  "/bin/sh -c '/usr/sb…"   8 days ago          Up About
a minute   22/tcp, 2888/tcp, 3888/tcp, 0.0.0.0:2181->2181/tcp   kafka-docker_zookeeper_1
```

### Run Node Microservice with Input Binding

Now that you have Kafka running locally on your machine, we'll need to run our microservices. We'll start by running the Node microservice that uses input bindings:

1. Navigate to Node subscriber directory in your CLI: `cd nodeapp`
2. Install dependencies: `npm install`
3. Run Node sample app with Dapr: `dapr run --app-id bindings-nodeapp --app-port 3000 node app.js --components-path ./components`

### Run Python Microservice with Output Binding

Next, we'll run the Python microservice that uses output bindings

1. Open a new CLI window and navigate to Python subscriber directory in your CLI: `cd pythonapp`
2. Install dependencies: `pip3 install requests`
3. Run Python sample app with Dapr: `dapr run --app-id bindings-pythonapp python3 app.py --components-path ./components`

### Observe Logs

1. Observe the Python logs, which demonstrate our successful output binding with Kafka:

```bash
[0m?[94;1m== APP == {'data': {'orderId': 1}}
[0m?[94;1m== APP == <Response [200]>
[0m?[94;1m== APP == {'data': {'orderId': 2}}
[0m?[94;1m== APP == <Response [200]>
[0m?[94;1m== APP == {'data': {'orderId': 3}}
[0m?[94;1m== APP == <Response [200]>
```

2. Observe the Node logs, which demonstrate our successful input binding with Kafka: 

```bash
[0m?[94;1m== APP == { orderId: 1 }
[0m?[94;1m== APP == Hello from Kafka!
[0m?[94;1m== APP == { orderId: 2 }
[0m?[94;1m== APP == Hello from Kafka!
[0m?[94;1m== APP == { orderId: 3 }
[0m?[94;1m== APP == Hello from Kafka!
```

### Cleanup

Once you're done using the sample locally, you can spin down your local Kafka Docker Container by running:

```bash
docker-compose -f ./docker-compose-single-kafka.yml down
```

## Run in Kubernetes

### Setting up a Kafka in Kubernetes

1. Install Kafka via [incubator/kafka helm chart](https://github.com/helm/charts/tree/master/incubator/kafka)
```
$ helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
$ helm repo update
$ kubectl create ns kafka
$ helm install dapr-kafka incubator/kafka --namespace kafka -f ./kafka-non-persistence.yaml
```

2. Wait until kafka pods are running
```
$ kubectl -n kafka get pods -w
NAME                     READY   STATUS    RESTARTS   AGE
dapr-kafka-0             1/1     Running   0          2m7s
dapr-kafka-zookeeper-0   1/1     Running   0          2m57s
dapr-kafka-zookeeper-1   1/1     Running   0          2m13s
dapr-kafka-zookeeper-2   1/1     Running   0          109s
```


### Deploy Assets

Now that we've set up the Kafka binding, we can deploy our assets.

1. In your CLI window, navigate to the deploy directory
2. Run `kubectl apply -f .` which will deploy our bindings-nodeapp and bindings-pythonapp microservices. It will also apply the kafka bindings component configuration we set up in the last step.
3. Run `kubectl get pods -w` to see each pod being provisioned.


### Observe Logs

1. Observe the Python app logs, which demonstrate our successful output binding with Kafka:

```bash
# Get Pod ID for bindings-pythonapp
$ kubectl get pods
NAME                                    READY   STATUS        RESTARTS   AGE
bindings-nodeapp-699489b8b6-mqhrj       2/2     Running       0          4s
bindings-pythonapp-644489969b-c8lg5     2/2     Running       0          4m9s
dapr-operator-86cddcfcb7-v2zjp          1/1     Running       0          6h6m
dapr-placement-5d6465f8d5-pz2qt         1/1     Running       0          6h6m
dapr-sidecar-injector-dc489d7bc-k2h4q   1/1     Running       0          6h6m
# Get the log from bindings-pythonapp
$ kubectl logs bindings-pythonapp-644489969b-c8lg5 python
...
{'data': {'orderId': 240}}
<Response [200]>
{'data': {'orderId': 241}}
<Response [200]>
...
```

2. Observe the Node app logs, which demonstrate our successful input bining with Kafka: 

```bash
# Get Pod ID for bindings-nodeapp
$ kubectl get pods
NAME                                    READY   STATUS        RESTARTS   AGE
bindings-nodeapp-699489b8b6-mqhrj       2/2     Running       0          4s
bindings-pythonapp-644489969b-c8lg5     2/2     Running       0          4m9s
dapr-operator-86cddcfcb7-v2zjp          1/1     Running       0          6h6m
dapr-placement-5d6465f8d5-pz2qt         1/1     Running       0          6h6m
dapr-sidecar-injector-dc489d7bc-k2h4q   1/1     Running       0          6h6m
# Get the log from bindings-nodeapp pod
$ kubectl logs bindings-nodeapp-699489b8b6-mqhrj node
Node App listening on port 3000!
...
Hello from Kafka!
{ orderId: 240 }
Hello from Kafka!
{ orderId: 241 }
...
```

### Cleanup

Once you're done using the sample, you can spin down your Kubernetes resources by navigating to the `./deploy` directory and running:

```bash
cd ./deploy
kubectl delete -f .
```

This will spin down each resource defined by the .yaml files in the `deploy` directory, including the kafka component.

Once you delete all samples apps, delete Kafka in the cluster.

```bash
# clean up kafka cluster
helm uninstall dapr-kafka --namespace kafka
```

## How it Works

Now that you've run the sample locally and/or in Kubernetes, let's unpack how this all works. Our app is broken up into input binding app and output binding app:

### Kafka Bindings yaml

Before looking at the application code, let's see the Kafka bindings component yamls([nodeapp](./nodeapp/components/kafka_bindings.yaml), [pythonapp](./pythonapp/components/kafka_bindings.yaml), and [Kubernetes](./deploy/kafka_bindings.yaml)), which specify `brokers` for Kafka connection, `topics` and `consumerGroup` for consumer, and `publishTopic` for publisher topic.

> See the howtos in [references](#references) for the details on input and output bindings


This configuration yaml creates `sample-topic` component to set up Kafka input and output bindings through the Kafka `sample` topic. 

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sample-topic
spec:
  type: bindings.kafka
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

Navigate to the `nodeapp` directory and open `app.js`, the code for our Node.js input bindings sample app. Here we're exposing one API endpoint using `express`. The API name must be identical to the component name which is specified in Kafka bindings component yaml. Then Dapr runtime will consume the event from `sample` topic and then send the POST request to Node app with the event payload.

```js
app.post('/sample-topic', (req, res) => {
    console.log("Hello from Kafka!");
    console.log(req.body);
    res.status(200).send();
});
```

### Python Output binding app

Navigate to the `pythonapp` directory and open `app.py`, the code for our output bindings sample app. This sends POST request to Dapr http endpoint `http://localhost:3500/v1.0/bindings/<output_bindings_name>` with the event payload every second. This app uses `sample-topic` bindings component name as `<output_bindings_name>`. Then Dapr runtime will send the event to `sample` topic which is specified in the above Kafka bindings component yaml.

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

## References

* [Howto - Create an event-driven app using input bindings](https://github.com/dapr/docs/tree/master/howto/trigger-app-with-input-binding)
* [Howto - Send events to external systems using Output Bindings](https://github.com/dapr/docs/tree/master/howto/send-events-with-output-bindings)
