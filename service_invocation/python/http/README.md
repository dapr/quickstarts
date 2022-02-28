# Service Invocation

In this quickstart, you'll create a checkout service and an order processor service to demonstrate how to use the service invocation API. The checkout service uses Dapr's http proxying capability to invoke a method on the order processing service.

Visit [this](https://docs.dapr.io/developing-applications/building-blocks/service-invocation/) link for more information about Dapr and service invocation.

This quickstart includes one checkout service:

- Python client service `checkout` 

And one order processor service: 
 
- Python order-processor service `order-processor`

### Run Python checkout with Dapr

1. Open a new terminal window and navigate to `checkout` directory: 

```bash
cd checkout
```

2. Install dependencies: 

<!-- STEP
name: Install Python dependencies
working_dir: ./checkout
-->

```bash
pip3 install -r requirements.txt 
```

3. Run the Python checkout app with Dapr: 
    
```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- python3 app.py
```

<!-- END_STEP -->
### Run Python order-processor with Dapr

1. Open a new terminal window and navigate to `order-processor` directory: 

```bash
cd order-processor
```

2. Install dependencies: 

<!-- STEP
name: Install Python dependencies
working_dir: ./order-processor
-->

```bash
pip3 install -r requirements.txt 
```

3. Run the Python order-processor app with Dapr: 

```bash
dapr run --app-port 6001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- python3 app.py
```

<!-- END_STEP -->
