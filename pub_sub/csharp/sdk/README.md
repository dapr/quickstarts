# Dapr pub/sub

In this quickstart, you'll create a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a publish-subcribe pattern. The publisher will generate messages of a specific topic, while subscribers will listen for messages of specific topics. See [Why Pub-Sub](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-overview/) to understand when this pattern might be a good choice for your software architecture.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/pubsub/) link for more information about Dapr and Pub-Sub.

> **Note:** This example leverages the Dapr client SDK.  If you are looking for the example using only HTTP [click here](../http).

This quickstart includes one publisher:

- Dotnet client message generator `checkout` 

And one subscriber: 
 
- Dotnet subscriber `order-processor`

## Run all apps with multi-app run template file:

This section shows how to run both applications at once using [multi-app run template files](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) with `dapr run -f .`.  This enables to you test the interactions between multiple applications.  

1. Open a new terminal window and run the multi app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Started Dapr with app id "order-processor-sdk"'
  - 'Started Dapr with app id "checkout-sdk"'
  - 'Published data: Order { OrderId = 2 }'
  - 'Subscriber received : Order { OrderId = 2 }'
expected_stderr_lines:
output_match_mode: substring
match_order: none
background: true
sleep: 15
timeout_seconds: 60
-->

```bash
dapr run -f .
```

The terminal console output should look similar to this:

```text
== APP - checkout-sdk == Published data: Order { OrderId = 1 }
== APP - order-processor-sdk == Subscriber received : Order { OrderId = 1 }
== APP - checkout-sdk == Published data: Order { OrderId = 2 }
== APP - order-processor-sdk == Subscriber received : Order { OrderId = 2 }
== APP - checkout-sdk == Published data: Order { OrderId = 3 }
== APP - order-processor-sdk == Subscriber received : Order { OrderId = 3 }
== APP - checkout-sdk == Published data: Order { OrderId = 4 }
== APP - order-processor-sdk == Subscriber received : Order { OrderId = 4 }
== APP - checkout-sdk == Published data: Order { OrderId = 5 }
== APP - order-processor-sdk == Subscriber received : Order { OrderId = 5 }
== APP - checkout-sdk == Published data: Order { OrderId = 6 }
== APP - order-processor-sdk == Subscriber received : Order { OrderId = 6 }
== APP - checkout-sdk == Published data: Order { OrderId = 7 }
== APP - order-processor-sdk == Subscriber received : Order { OrderId = 7 }
== APP - checkout-sdk == Published data: Order { OrderId = 8 }
== APP - order-processor-sdk == Subscriber received : Order { OrderId = 8 }
== APP - checkout-sdk == Published data: Order { OrderId = 9 }
== APP - order-processor-sdk == Subscriber received : Order { OrderId = 9 }
== APP - checkout-sdk == Published data: Order { OrderId = 10 }
== APP - order-processor-sdk == Subscriber received : Order { OrderId = 10 }
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
dapr run --app-id order-processor-sdk --resources-path ../../../components/ --app-port 7006 -- dotnet run
```

### Run Dotnet message publisher with Dapr

1. Run the Dotnet publisher app with Dapr: 

   
```bash
cd ./checkout
dapr run --app-id checkout-sdk --resources-path ../../../components/ -- dotnet run
```

2. Stop and clean up application processes

```bash
dapr stop --app-id order-processor-sdk
dapr stop --app-id checkout-sdk
```
