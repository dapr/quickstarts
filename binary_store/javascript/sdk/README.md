# Dapr Binary Store API (JavaScript SDK)

In this quickstart, you'll store, download, overwrite, and delete a file using the Dapr JavaScript SDK.

The Binary Store building block is available in Dapr runtime 1.19.0-rc.3 and later. This example uses the in-memory binary store component, so it does not require an external storage service and its files are discarded when the Dapr sidecar stops.

Visit the [JavaScript SDK API reference](https://github.com/dapr/js-sdk/blob/main/documentation/reference.md) for more information about the Binary Store SDK APIs.

> **Note:** This example uses the Dapr JavaScript SDK over gRPC. If you are looking for the example using the HTTP API directly, [click here](../http/).

This quickstart includes one app, `binary-store`, responsible for storing and retrieving a small text file as binary data. It pins `@dapr/dapr` to `3.19.0-rc.3`, which includes the Binary Store APIs. Use Node.js 22 or later to satisfy the SDK's resolved gRPC transport dependencies.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template file](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) and Dapr CLI with `dapr run -f .`.

If needed, initialize a compatible prerelease runtime before running the quickstart:

```bash
dapr init --runtime-version 1.19.0-rc.3
```

1. Open a terminal in this directory and install the app's dependencies:

<!-- STEP
name: Install Node dependencies
-->

```bash
cd ./binary-store
npm install
cd ..
```

<!-- END_STEP -->

2. Run the multi-app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Stored: greeting.txt'
  - 'Downloaded: Hello from the Dapr binary store!'
  - 'Overwritten: greeting.txt'
  - 'Downloaded updated content: Updated binary store file.'
  - 'Deleted: greeting.txt'
  - 'Exited App successfully'
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

<!-- END_STEP -->

The app creates `greeting.txt` with `setBinaryFile` (which does not overwrite existing files by default), then downloads it into a `Buffer` with `getBinaryFileBytes`. It replaces the file by passing `{ overwrite: true }` to `setBinaryFile`, streams the replacement into a Node.js `Writable` with `getBinaryFile`, and deletes it with `deleteBinaryFile`.

Both downloads are checked byte-for-byte against the uploaded content before printing:

```text
Stored: greeting.txt
Downloaded: Hello from the Dapr binary store!
Overwritten: greeting.txt
Downloaded updated content: Updated binary store file.
Deleted: greeting.txt
```

The writable stream collects chunks in memory only to verify this small file. For larger files, you can pass a file write stream instead to avoid buffering the entire download. The client connection is closed when the app finishes, and failures are reported with a nonzero exit code.

3. Stop and clean up application processes:

<!-- STEP
name: Stop multi-app run
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## Run the app individually

1. Open a terminal in this directory and install the `binary-store` app's dependencies:

```bash
cd ./binary-store
npm install
```

2. Run the Dapr sidecar and application:

```bash
dapr run --app-id binary-store-sdk --dapr-grpc-port 50091 --resources-path ../../../components/ -- npm start
```

The app uses the `DAPR_GRPC_PORT` environment variable supplied by Dapr, defaulting to `50091` when it is not set.
