# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher will generate messages of a specific topic, while subscribers will listen for messages of specific topics.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages HTTP `requests` only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk/).

This quickstart includes one publisher:

- Go client message generator `checkout` 

And one subscriber: 
 
- Go subscriber `order-processor`

### Run Go message publisher with Dapr

1. Open a new terminal window and navigate to `checkout` directory: 

```bash
cd checkout
```

2. Install dependencies: 

<!-- STEP
name: Build Go file
working_dir: ./checkout
-->

```bash
go build app.go
```

3. Run the Go publisher app with Dapr: 
    
```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 --components-path ../../../components -- go run app.go
```

<!-- END_STEP -->
### Run Go message subscriber with Dapr

1. Open a new terminal window and navigate to `order-processor` directory: 

```bash
cd order-processor
```

2. Install dependencies: 

<!-- STEP
name: Build Go file
working_dir: ./order-processor
-->

```bash
go build app.go
```

3. Run the Go subscriber app with Dapr: 

```bash
dapr run --app-port 6001 --app-id order-processor --app-protocol http --dapr-http-port 3501 --components-path ../../../components -- go run app.go
```

<!-- END_STEP -->