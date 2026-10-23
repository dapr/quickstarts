# Dapr vector quickstarts

Store precomputed vectors and find similar records using the [Dapr Vector building block](https://docs.dapr.io/developing-applications/building-blocks/vector/).

| Language | HTTP | SDK |
| --- | --- | --- |
| JavaScript | [HTTP quickstart](javascript/http/) | [SDK quickstart](javascript/sdk/) |

Both examples target Dapr runtime **1.19.0**; the SDK example pins `@dapr/dapr` to **3.19.0**. They demonstrate collection creation, listing and inspection, vector upsert and retrieval, similarity search, metadata filtering, batch queries, and deletion.

The shared [component](components/vectorstore.yaml) uses `vector.in-memory`. No vector database, credentials, or embedding model is required. Data belongs to each sidecar and is lost when that sidecar stops; this component is for development and testing, not production.

The three-dimensional vectors are fixed teaching examples, not real text embeddings. In an application, generate embeddings before calling Dapr and use a collection with the same number of dimensions. Cosine similarity ranks higher scores first. Record `metadata` is filterable JSON; `payload` is opaque bytes and is not filterable.

Each variant's README is an executable test. Run `make validate` from that variant's directory. The existing JavaScript CI workflow discovers both variants automatically.
