# Dapr pub/sub (HTTP Client)

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher will generate messages of a specific topic, while subscribers will listen for messages of specific topics. See [Why Pub-Sub](#why-pub-sub) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages HTTPClient only.  If you are looking for the example using the Dapr Client SDK (recommended) [click here](../sdk).

This quickstart includes one publisher:

- Dotnet client message generator `checkout` 

And one subscriber: 
 
- Dotnet subscriber `order-processor`

## Run all apps with multi-app run template file:

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.  

1. Open a new terminal window and run `order-processor` and `checkout` using the multi app run template defined in [dapr.yaml](./dapr.yaml):

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Started Dapr with app id "order-processor-http"'
  - 'Started Dapr with app id "checkout-http"'
  - '== APP - checkout-http == Published data: Order { OrderId = 2 }'
  - '== APP - order-processor-http == Subscriber received : 2'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 15
timeout_seconds: 45
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this:

```text
== APP - checkout-http == Published data: Order { OrderId = 1 }
== APP - order-processor-http == Subscriber received : 1
== APP - checkout-http == Published data: Order { OrderId = 2 }
== APP - order-processor-http == Subscriber received : 2
== APP - checkout-http == Published data: Order { OrderId = 3 }
== APP - order-processor-http == Subscriber received : 3
== APP - checkout-http == Published data: Order { OrderId = 4 }
== APP - order-processor-http == Subscriber received : 4
== APP - checkout-http == Published data: Order { OrderId = 5 }
== APP - order-processor-http == Subscriber received : 5
== APP - checkout-http == Published data: Order { OrderId = 6 }
== APP - order-processor-http == Subscriber received : 6
== APP - checkout-http == Published data: Order { OrderId = 7 }
== APP - order-processor-http == Subscriber received : 7
== APP - checkout-http == Published data: Order { OrderId = 8 }
== APP - order-processor-http == Subscriber received : 8
== APP - checkout-http == Published data: Order { OrderId = 9 }
== APP - order-processor-http == Subscriber received : 9
== APP - checkout-http == Published data: Order { OrderId = 10 }
== APP - order-processor-http == Subscriber received : 10
```

2. Stop and clean up application processes

```bash
dapr stop -f .
```
<!-- END_STEP -->

## Run a single app at a time with Dapr (Optional)

An alternative to running all or multiple applications at once is to run single apps one-at-a-time using multiple `dapr run .. -- dotnet run` commands.  This next section covers how to do this. 

### Run Dotnet message subscriber with Dapr

1. Run the Dotnet subscriber app with Dapr: 

```bash
cd ./order-processor
dapr run --app-id order-processor-http --resources-path ../../../components/ --app-port 7005 -- dotnet run
```

### Run Dotnet message publisher with Dapr

1. Run the Dotnet publisher app with Dapr: 

  
```bash
cd ./checkout
dapr run --app-id checkout-http --resources-path ../../../components/ -- dotnet run
```

2. Stop and clean up application processes

```bash
dapr stop --app-id order-processor-http
dapr stop --app-id checkout-http
```
