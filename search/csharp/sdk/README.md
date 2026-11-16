# Dapr Search API (Dotnet SDK)

In this quickstart, you'll index, retrieve, search, and delete product documents using Dapr's Search API and the .NET SDK.

This example targets Dapr runtime **1.19.0** and Dapr .NET SDK **1.19.0** (`Dapr.Search`), and requires the .NET 10 SDK. Search is an alpha API. It uses an in-memory search store, so it does not require an external search service and its indexes are discarded when the Dapr sidecar stops.

The Search API finds documents by their indexed content, unlike retrieving a document by its exact ID. See the [Search building block contract](https://github.com/dapr/components-contrib/blob/master/search/README.md) for more information.

> **Note:** This example uses the Dapr .NET SDK. For direct HTTP calls without the SDK, see the [HTTP quickstart](../http/).

This quickstart includes one app:

- Search, responsible for indexing two products and finding the one whose title contains `Dapr`.

## Run the app with the template file

This section shows how to run the application using the [multi-app run template file](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) and Dapr CLI with `dapr run -f .`.

If needed, initialize Dapr runtime 1.19.0 before running the quickstart:

```bash
dapr init --runtime-version 1.19.0
```

Open a terminal in this directory (`search/csharp/sdk`). The SDK discovers the sidecar's gRPC endpoint from the environment variables set by the Dapr CLI.

Build the app and restore its SDK dependency:

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

### Understanding the SDK calls

`DaprSearchClientBuilder` creates a reusable `DaprSearchClient`. The `storeName` argument identifies the shared `searchstore` component in `../../components/searchstore.yaml`; `indexName` identifies the `products` index inside it.

| Operation | SDK method |
|---|---|
| Create an index | `CreateIndexAsync` |
| Index documents (insert or replace by ID) | `IndexDocumentsAsync<Product>` |
| Retrieve documents by ID | `GetDocumentsAsync<Product>` |
| Search indexed content | `SearchAsync<Product>` |
| Delete documents by ID | `DeleteDocumentsAsync` |
| Delete an index | `DeleteIndexAsync` |

`SearchDocument<Product>` associates an ID with a typed product. The SDK serializes the content as JSON and deserializes returned content back into `Product`. Its default web JSON naming policy produces the `title` field used in `SearchFields`.

Reads and search results omit document content by default. The app requests `includeContent: true` for retrieval and `IncludeContent = true` for search, then verifies the returned ID and product content.

Writes can return before indexing finishes. The app uses `IndexingMode.WaitForCompletion` with a five-second `WaitTimeout` and `IndexingWaitTimeoutAction.FailRequest`, then checks for `IndexAck.Completed`. It also checks `FailedItems`: even a completed batch can contain individual document failures. The client timeout is longer than the indexing wait timeout.

## Run the app individually

1. Open a terminal and build the `search` app:

```bash
cd ./search
dotnet build
```

2. Run the Dapr sidecar and application:

```bash
dapr run --app-id search-sdk --resources-path ../../../components/ -- dotnet run
```

## Validate the quickstart

From `search/csharp/sdk`, run `make validate`. Mechanical Markdown builds the app, checks the ordered output from the multi-app run, and stops the app using the STEP blocks above.
