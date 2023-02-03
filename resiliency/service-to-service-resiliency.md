# Dapr Resiliency: Service Invoke

In this QuickStart, you will run two microservice applications. One microservice (`checkout`) will continuously make Dapr service invocation requests to the other microservice (`order-processor`). When requests begin to fail, Dapr resiliency policies are applied.

Visit the documentation about [Dapr resiliency](https://docs.dapr.io/operations/resiliency/resiliency-overview/) link for more information

This quickstart includes one service:

- Caller service `checkout` 
- Callee service `order-processor` 
- Resiliency spec `resiliency.yaml`

### Run both services with Dapr and resiliency enabled

1. Open two terminal windows. In one terminal window, navigate to the `checkout` service. In the other terminal window, navigate to the `order-processor` service. Install dependencies for each service and run both services with resiliency enabled: 

### C# example

##### Order Processor Service:

```bash
cd ../service_invocation/csharp/http/order-processor
dotnet restore
dotnet build
dapr run --app-port 7001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- dotnet run
```

##### Checkout Service:

```bash
cd ../service_invocation/csharp/http/checkout
dotnet restore
dotnet build
dapr run  --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- dotnet run
```

### Go example

##### Order Processor Service:

```bash
cd ../service_invocation/go/http/order-processor
go build .
dapr run --app-port 6001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- go run .
```

##### Checkout Service:

```bash
cd ../service_invocation/go/http/checkout
go build .
dapr run  --app-id checkout --resources-path ../../../resources/  --app-protocol http --dapr-http-port 3500 -- go run .
```

### Java example

##### Order Processor Service

```bash
cd ../service_invocation/java/http/order-processor
mvn clean install
dapr run --app-id order-processor --resources-path ../../../resources/ --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

##### Checkout Service

```bash
cd ../service_invocation/java/http/checkout
mvn clean install
dapr run --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```

### JavaScript example

##### Order Processor Service

```bash
cd ../service_invocation/javascript/http/order-processor
npm install
dapr run --app-port 5001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- npm start
```

##### Checkout Service

```bash
cd ../service_invocation/javascript/http/checkout
npm install
dapr run  --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- npm start
```

### Python example

##### Order Processor Service

```bash
cd ../service_invocation/python/http/order-processor
pip3 install -r requirements.txt 
dapr run --app-port 8001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- python3 app.py
```

##### Checkout Service

```bash
cd ../service_invocation/python/http/checkout
pip3 install -r requirements.txt 
dapr run  --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- python3 app.py
```

### Expected output

Once both services are running, the `order-processor` service will recieve orders from the `checkout`service continuously using Dapr's service invoke API.

##### `order-processor` output

```bash
== APP == Order received: { orderId: 1 }
== APP == Order received: { orderId: 2 }
== APP == Order received: { orderId: 3 }
```

### Simulate ann application failure by stopping the `order-processor` service

Simulate a system failure by stopping the `order-processor` service running in your second terminal window.

```script
CTRL + C
```

### Observe retry and circuit breaker policies are applied

Policies defined in the resiliency.yaml spec:

```yaml
retryForever:
  policy: constant
  duration: 5s
  maxRetries: -1 

circuitBreakers:
  simpleCB:
  maxRequests: 1
  timeout: 5s 
  trip: consecutiveFailures >= 5
```

##### Applied policies

```bash
INFO[0005] Error processing operation endpoint[order-processor, order-processor:orders]. Retrying...  
INFO[0025] Circuit breaker "order-processor:orders" changed state from closed to open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open  
```

### Simulate the application recovering by restarting the order-processor service:

Simulate the `order-processor` service recovering by restarting the application using the `dapr run` command:

### C# example

##### Order Processor Service

```bash
dapr run --app-port 7001 --app-id order-processor --resources-path --app-protocol http --dapr-http-port 3501 -- dotnet run
```

### Go example

##### Order Processor Service

```bash
dapr run --app-port 6001 --app-id order-processor --resources-path --app-protocol http --dapr-http-port 3501 -- go run .
```

### Java example

##### Order Processor Service

```bash
dapr run --app-id order-processor --resources-path --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

### JavaScript example

##### Order Processor Service

```bash
dapr run --app-port 5001 --app-id order-processor --resources-path --app-protocol http --dapr-http-port 3501 -- npm start
```

### Python example

##### Order Processor Service:

```bash
dapr run --app-port 8001 --app-id order-processor --resources-path --app-protocol http --dapr-http-port 3501 -- python3 app.py
```

### Observe orders have resumed sequentially:

##### `order-processor` output:

```bash
== APP == Order received: { orderId: 4 }
== APP == Order received: { orderId: 5 }
== APP == Order received: { orderId: 6 }
== APP == Order received: { orderId: 7 }
```

### Stop the apps with Dapr

```bash
dapr stop --app-id order-processor
dapr stop --app-id checkout
```
