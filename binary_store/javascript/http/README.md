# Dapr Binary Store API (JavaScript HTTP)

In this quickstart, you'll store, download, overwrite, and delete a file using Dapr's Binary Store HTTP API.

The Binary Store building block is available in Dapr runtime 1.19.0 and later. This example uses the in-memory binary store component, so it does not require an external storage service and its files are discarded when the Dapr sidecar stops.

> **Note:** This example uses Node.js's built-in `fetch` to call the HTTP API directly. If you are looking for the example using the Dapr JavaScript SDK, [click here](../sdk/).

This quickstart includes one app, `binary-store`, responsible for storing and retrieving a small text file as binary data. It requires Node.js 18 or later and has no npm dependencies to install.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template file](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) and Dapr CLI with `dapr run -f .`.

Open a terminal in this directory and run the multi-app run template:

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

<!-- END_STEP -->

The application sends UTF-8 bytes with `Content-Type: application/octet-stream` to `/v1.0-alpha1/binarystore/binarystore/greeting.txt`. It creates the file using `POST` without allowing an overwrite, downloads it using `GET`, replaces it using `PUT`, downloads it again, and deletes it using `DELETE`. Both downloads are checked byte-for-byte against the uploaded content before printing:

```text
Stored: greeting.txt
Downloaded: Hello from the Dapr binary store!
Overwritten: greeting.txt
Downloaded updated content: Updated binary store file.
Deleted: greeting.txt
```

Stop and clean up application processes:

<!-- STEP
name: Stop multi-app run
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## Run the app individually

1. Open a terminal in this directory and navigate to the `binary-store` app:

```bash
cd ./binary-store
```

2. Run the Dapr sidecar and application:

```bash
dapr run --app-id binary-store-http --dapr-http-port 3590 --resources-path ../../../components/ -- npm start
```

The app uses the `DAPR_HTTP_PORT` environment variable supplied by Dapr, defaulting to `3590` when it is not set.
