/*
Copyright 2026 The Dapr Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import assert from "node:assert/strict";
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const storeName = "searchstore";
const indexName = "products";
const cookbook = { title: "Dapr cookbook", price: 29 };
const documents = [
  { id: "1", content: cookbook },
  { id: "2", content: { title: "JavaScript services", price: 39 } },
];

// Wait for writes to complete before reading; acceptance alone does not guarantee success.
const writeOptions = {
  mode: "waitForCompletion",
  waitTimeout: "5s",
  onWaitTimeout: "failRequest",
};

async function main() {
  const client = new DaprClient({
    daprHost: "localhost",
    daprPort: process.env.DAPR_GRPC_PORT || "50001",
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  try {
    await client.search.createIndex(storeName, indexName, { signal: AbortSignal.timeout(30_000) });
    console.log(`Created index: ${indexName}`);

    try {
      const indexed = await client.search.indexDocuments(storeName, indexName, documents, {
        ...writeOptions,
        signal: AbortSignal.timeout(30_000),
      });
      assert.deepEqual(indexed.failedItems, [], "Indexing returned document failures");
      checkCompleted(indexed.ack);
      console.log(`Indexed: ${documents.length} products`);

      const retrieved = await client.search.getDocuments(storeName, indexName, ["1"], {
        includeContent: true,
        signal: AbortSignal.timeout(30_000),
      });
      assert.equal(retrieved.length, 1, "Expected exactly one retrieved product");
      const retrievedProduct = checkProduct(retrieved[0]);
      console.log(`Retrieved: ${retrievedProduct.title}`);

      const result = await client.search.search(
        storeName,
        indexName,
        { text: "Dapr", searchFields: ["title"], includeContent: true },
        { signal: AbortSignal.timeout(30_000) },
      );
      assert.equal(result.hits.length, 1, "Expected exactly one product matching Dapr");
      const matchedProduct = checkProduct(result.hits[0].document);
      console.log(`Search match: ${matchedProduct.title}`);

      const deleted = await client.search.deleteDocuments(
        storeName,
        indexName,
        documents.map(({ id }) => id),
        { ...writeOptions, signal: AbortSignal.timeout(30_000) },
      );
      checkCompleted(deleted);
      console.log(`Deleted: ${documents.length} products`);

      // Omitting the query matches every document, not just the earlier text.
      const remaining = await client.search.search(storeName, indexName, undefined, {
        signal: AbortSignal.timeout(30_000),
      });
      assert.equal(remaining.hits.length, 0, "Deleted products are still searchable");
      console.log(`Remaining search matches: ${remaining.hits.length}`);
    } finally {
      await client.search.deleteIndex(storeName, indexName, { signal: AbortSignal.timeout(30_000) });
      console.log(`Deleted index: ${indexName}`);
    }
  } finally {
    await client.stop();
  }
}

function checkProduct(document) {
  assert.equal(document.id, "1", "Unexpected product ID");
  assert.deepEqual(document.content, cookbook, "Returned content differs from the indexed product");
  return document.content;
}

function checkCompleted(ack) {
  assert.equal(ack, "completed", "Expected a completed write");
}

main().catch((error) => {
  console.error("Search failed:", error);
  process.exitCode = 1;
});
