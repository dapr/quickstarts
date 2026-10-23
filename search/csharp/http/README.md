# Dapr Search API (Dotnet HTTP)

In this quickstart, you'll index, retrieve, search, and delete product documents using Dapr's Search HTTP API.

This example targets Dapr runtime **1.19.0** and requires the .NET 10 SDK. Search is an alpha API. It uses an in-memory search store, so it does not require an external search service and its indexes are discarded when the Dapr sidecar stops.

The Search API finds documents by their indexed content, unlike retrieving a document by its exact ID. See the [Search building block contract](https://github.com/dapr/components-contrib/blob/master/search/README.md) for more information.

> **Note:** This example uses `HttpClient` to call the HTTP API directly; it does not use the Dapr .NET SDK. For the Dapr .NET SDK **1.19.0** example, see the [SDK quickstart](../sdk/).

This quickstart includes one app:

- Search, responsible for indexing two products and finding the one whose title contains `Dapr`.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template file](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) and Dapr CLI with `dapr run -f .`.

If needed, initialize Dapr runtime 1.19.0 before running the quickstart:

```bash
dapr init --runtime-version 1.19.0
```

Open a terminal in this directory (`search/csharp/http`). The HTTP port `3592` must be available. The app reads `DAPR_HTTP_PORT`, which the CLI sets from the run template.

Build the app:

<!-- STEP
name: Build search app
expected_stdout_lines:
  - 'Build succeeded.'
output_match_mode: substring
timeout_seconds: 120
-->

```bash
dotnet build ./search
```

<!-- END_STEP -->

Run the multi-app run template:

<!-- STEP
name: Run multi app run template
expected_stdout_lines:
  - 'Created index: products'
  - 'Indexed: 2 products'
  - 'Retrieved: Dapr cookbook'
  - 'Search match: Dapr cookbook'
  - 'Deleted: 2 products'
  - 'Remaining search matches: 0'
  - 'Deleted index: products'
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

The application creates the `products` index, indexes two products, retrieves one by ID, and searches for `Dapr` in their titles. It then deletes both documents, checks that a match-all search returns no results, and deletes the index.

```text
Created index: products
Indexed: 2 products
Retrieved: Dapr cookbook
Search match: Dapr cookbook
Deleted: 2 products
Remaining search matches: 0
Deleted index: products
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

### Understanding the HTTP requests

All requests use `/v1.0-alpha1/search/searchstore/indexes/`, where `searchstore` is the component name in `../../components/searchstore.yaml`.

| Operation | Method and relative path |
|---|---|
| Create an index | `POST products` |
| Index documents (insert or replace by ID) | `POST products/documents` |
| Retrieve documents by ID | `POST products/documents/get` |
| Search indexed content | `POST products/query` |
| Delete documents by ID | `POST products/documents/delete` |
| Delete an index | `DELETE products` |

Document `content` is a JSON object encoded as UTF-8 bytes. The HTTP API uses protobuf JSON encoding, so those bytes appear as a **base64 string**, not a nested JSON object. `PostAsJsonAsync` encodes the sample's `byte[]` values automatically; `GetBytesFromBase64` decodes returned content.

Reads and search results omit document content by default. The app requests `includeContent: true` and verifies the returned ID and product content.

Writes can return before indexing finishes. The app requests `INDEXING_MODE_WAIT_FOR_COMPLETION` with a five-second `waitTimeout` and `INDEXING_WAIT_TIMEOUT_ACTION_FAIL_REQUEST`, then checks for `INDEX_ACK_COMPLETED`. It also checks `failedItems`: even a completed batch can contain individual document failures. The HTTP timeout is longer than the indexing wait timeout.

## Run the app individually

1. Open a terminal and build the `search` app:

```bash
cd ./search
dotnet build
```

2. Run the Dapr sidecar and application:

```bash
dapr run --app-id search-http --dapr-http-port 3592 --resources-path ../../../components/ -- dotnet run
```

## Validate the quickstart

From `search/csharp/http`, run `make validate`. Mechanical Markdown builds the app, checks the ordered output from the multi-app run, and stops the app using the STEP blocks above.
