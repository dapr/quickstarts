# Dapr workflows

In this quickstart, you'll create a microservice to demonstrate Dapr's workflow API. The service starts and manages a workflow to store and retrieve data in a state store.

This quickstart includes one service:

- Dotnet client service `order-processor` 

### Run Dotnet service with Dapr

1. Open a new terminal window and navigate to `order-processor` directory: 

<!-- STEP
name: Install Dotnet dependencies
-->

```bash
cd ./order-processor
dotnet restore
dotnet build
```

<!-- END_STEP -->
2. Run the Dotnet service app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
  - '== APP == Welcome to the workflows example!'
  - '== APP ==       There are now: 90 Cars left in stock'
  - '== APP == Workflow Status: Completed'
  - "Exited App successfully"
expected_stderr_lines:
output_match_mode: substring
background: true
sleep: 15
-->
    
```bash
cd ./order-processor
dapr run dotnet run
```

<!-- END_STEP -->
