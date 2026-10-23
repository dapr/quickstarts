# Dapr Search API (JavaScript SDK)

In this quickstart, you'll index, retrieve, search, and delete product documents using the Dapr JavaScript SDK.

This example targets Dapr runtime **1.19.0** and the stable Dapr JavaScript SDK **3.19.0** (`@dapr/dapr`), and requires **Node.js 22 or later** and npm. The locked SDK dependencies require Node.js 22. Search is an alpha API. It uses an in-memory search store, so it does not require an external search service and its indexes are discarded when the Dapr sidecar stops.

The Search API finds documents by their indexed content, unlike retrieving a document by its exact ID. See the [Search building block contract](https://github.com/dapr/components-contrib/blob/master/search/README.md) for more information.

> **Note:** This example uses the Dapr JavaScript SDK over gRPC. For direct HTTP requests without the SDK, see the [HTTP quickstart](../http/).

This quickstart includes one app, `search`, responsible for indexing two products and finding the one whose title contains `Dapr`.

## Run the app with the template file

This section uses the [multi-app run template](https://docs.dapr.io/developing-applications/local-development/multi-app-dapr-run/multi-app-overview/) and Dapr CLI with `dapr run -f .`.

If needed, initialize the Dapr runtime before running the quickstart. Slim mode is sufficient because this sample does not need containers:

```bash
dapr init --slim --runtime-version 1.19.0
```

Open a terminal in this directory (`search/javascript/sdk`). The SDK connects to the sidecar's gRPC port using `DAPR_GRPC_PORT`, which the Dapr CLI sets. Stop other samples using the app ID `search-sdk` before running this one.

Install the pinned SDK dependencies:

<!-- STEP
name: Install search app
timeout_seconds: 120
-->

```bash
npm ci --prefix ./search
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

Stop and clean up application processes:

<!-- STEP
name: Stop multi-app run
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

### Understanding the SDK calls

`DaprClient` creates a reusable client with `CommunicationProtocolEnum.GRPC`. Every Search call names the shared `searchstore` component in `../../components/searchstore.yaml` and the `products` index inside it.

| Operation | SDK method |
|---|---|
| Create an index | `client.search.createIndex` |
| Index documents (insert or replace by ID) | `client.search.indexDocuments` |
| Retrieve documents by ID | `client.search.getDocuments` |
| Search indexed content | `client.search.search` |
| Delete documents by ID | `client.search.deleteDocuments` |
| Delete an index | `client.search.deleteIndex` |

Pass plain JavaScript objects as document `content`; the SDK serializes them as JSON bytes and deserializes returned documents. Reads and search results omit content by default, so the app requests `includeContent: true` and asserts that both the returned ID and product content match the indexed document.

Writes can return before indexing finishes. The app requests `mode: "waitForCompletion"` with a five-second `waitTimeout` and `onWaitTimeout: "failRequest"`. It checks both `failedItems` and the `"completed"` acknowledgement from indexing, and the `"completed"` acknowledgement returned by deletion. Each call receives a 30-second abort signal, longer than the indexing wait timeout.

Omitting the search query matches all documents, which verifies that both products were deleted. The index is deleted in a `finally` block, and `client.stop()` releases SDK connections even on failure. Request failures and failed assertions are logged and produce a nonzero exit code.

## Run the app individually

From this directory, install and enter the app:

```bash
npm ci --prefix ./search
cd ./search
```

Run the Dapr sidecar and application:

```bash
dapr run --app-id search-sdk --resources-path ../../../components/ -- npm run start
```

## Validate the quickstart

From `search/javascript/sdk`, run `make validate`. Mechanical Markdown installs the pinned SDK, checks the seven ordered output lines from the multi-app run, and stops the app using the STEP blocks above. Assertions in the app additionally verify write completion, document contents, and that no documents remain after deletion.
