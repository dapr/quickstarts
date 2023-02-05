# Dapr workflows

In this quickstart, you'll create a simple console application to demonstrate Dapr's workflow programming model and the workflow management API. The console app starts and manages the lifecycle of a workflow that stores and retrieves data in a Dapr state store.

This quickstart includes one project:

- .NET console app `order-processor` 

### Run the order processor workflow

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
2. Run the console app with Dapr: 

<!-- STEP
name: Run order-processor service
expected_stdout_lines:
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
