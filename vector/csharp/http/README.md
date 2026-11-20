# Dapr vector (.NET HTTP)

Store and query precomputed vectors through Dapr's HTTP API using .NET `HttpClient`.

See the [Dapr Vector building block](https://docs.dapr.io/developing-applications/building-blocks/vector/) for more information.

> **Note:** This example uses HTTP directly without a Dapr SDK dependency. For the Dapr .NET SDK example (recommended), see [the SDK quickstart](../sdk/).

## Prerequisites

- .NET 10 SDK.
- Dapr CLI with Dapr runtime **1.19.0** installed. Follow the [Dapr installation instructions](https://docs.dapr.io/getting-started/install-dapr-cli/), initialize with `dapr init --runtime-version 1.19.0`, and confirm with `dapr --version`.

The shared [vectorstore component](../../components/vectorstore.yaml) uses `vector.in-memory`, so no external vector database, credentials, or embedding model is needed. Data is local to the sidecar and disappears when it stops. This component is only for development and testing.

The app creates a three-dimensional `catalog` collection and stores three fixed vectors. These stand in for embeddings your application would generate. It retrieves a vector and its payload, finds the two closest records using cosine similarity, filters by record metadata using an existing vector's ID, runs two queries in a batch, and deletes the vectors and collection.

HTTP calls use `/v1.0-alpha1/vector/{storeName}/collections`. Request bodies use protobuf JSON: enum names such as `DISTANCE_METRIC_COSINE`, base64-encoded payloads, and a query vector shaped as `{ "vector": { "values": [1, 0, 0] } }`. Metadata is filterable JSON; payloads are not filterable. The app reads `DAPR_HTTP_PORT`, which the CLI assigns when starting the sidecar.

Writes explicitly wait for completion with a five-second timeout and fail on timeout, rather than treating queued work as completed. The app checks per-item upsert and batch-query errors, retrieved data, ranking, and deletion. Failed checks throw exceptions and exit nonzero.

## Run with the multi-app template (`dapr run -f .`)

Start in this README's directory (`vector/csharp/http`).

1. Build the app:

<!-- STEP
name: Build vector HTTP app
timeout_seconds: 180
-->

```bash
dotnet build ./vector/Program.csproj
```

<!-- END_STEP -->

2. Run the app using the [multi-app template](./dapr.yaml):

<!-- STEP
name: Run vector HTTP quickstart
expected_stdout_lines:
  - 'Created collection: catalog (3 dimensions, cosine)'
  - 'Collection listed: catalog'
  - 'Upserted vectors: 3 (completed)'
  - 'Retrieved vector: book-1 [1,0,0]'
  - 'Retrieved payload: Dapr for beginners'
  - 'Nearest vectors: book-1, book-2'
  - 'Filtered vectors: toy-1'
  - 'Batch nearest vectors: book-1, toy-1'
  - 'Vectors after deletion: 0'
  - 'Deleted collection: catalog'
  - 'Vector quickstart completed'
expected_stderr_lines:
output_match_mode: substring
match_order: sequential
background: true
sleep: 15
timeout_seconds: 60
-->

```bash
dapr run -f .
```

<!-- END_STEP -->

The output lists `book-1` before `book-2` because their cosine scores are approximately 1 and 0.8. Filtering for toys excludes both books, even though `book-1` is the closest match. Batch results preserve query order.

3. Stop the template and its sidecar:

<!-- STEP
name: Stop vector HTTP quickstart
timeout_seconds: 30
-->

```bash
dapr stop -f .
```

<!-- END_STEP -->

## Run individually

From this README's directory:

```bash
cd vector
dotnet build
dapr run --app-id vector-http --resources-path ../../../components/ -- dotnet run --no-build
```

The app prints the same results and exits after cleanup.

## Validate the README

With GNU Make, Bash, and [mechanical-markdown](https://github.com/dapr/mechanical-markdown) installed, run `make validate` from this README's directory. It executes the annotated steps above and checks their deterministic output.
