# Dapr Binary Store API (C# SDK)

In this quickstart, you'll store, download, overwrite, and delete a file using the Dapr Binary Store SDK for .NET.

The Binary Store building block is available in Dapr runtime 1.19.0 and later. This example uses the in-memory binary store component, so it does not require an external storage service and its files are discarded when the Dapr sidecar stops.

> **Note:** This example uses the Dapr .NET SDK. If you are looking for the example using the HTTP API directly, [click here](../http/).

This quickstart includes one app:

- Binary Store, responsible for storing and retrieving a small text file as binary data.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template file](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) and Dapr CLI with `dapr run -f .`.

Open a new terminal window and run the multi-app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Stored: greeting.txt'
  - 'Downloaded: Hello from the Dapr binary store!'
  - 'Overwritten: greeting.txt'
  - 'Downloaded updated content: Updated binary store file.'
  - 'Deleted: greeting.txt'
expected_stderr_lines:
output_match_mode: substring
match_order: sequential
background: true
sleep: 10
timeout_seconds: 120
-->

```bash
dapr run -f .
```

The application declares an `IDocumentStore` interface with `[BinaryStore("binarystore")]`. The Dapr source generator creates its implementation and the `WithDocumentStore()` registration extension. The generated typed client creates a file, downloads it as bytes, replaces it, streams the replacement into memory for verification, and deletes it.

```text
Stored: greeting.txt
Downloaded: Hello from the Dapr binary store!
Overwritten: greeting.txt
Downloaded updated content: Updated binary store file.
Deleted: greeting.txt
```

<!-- END_STEP -->

Stop and clean up application processes.

<!-- STEP
name: Stop multi-app run
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## Run the app individually

1. Open a terminal and build the `binary-store` app:

```bash
cd ./binary-store
dotnet build
```

2. Run the Dapr sidecar and application:

```bash
dapr run --app-id binary-store-sdk --dapr-grpc-port 50091 --resources-path ../../../components/ -- dotnet run
```
