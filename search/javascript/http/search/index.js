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

const indexName = "products";
const cookbook = { title: "Dapr cookbook", price: 29 };
const documents = [
  { id: "1", content: cookbook },
  { id: "2", content: { title: "JavaScript services", price: 39 } },
];
const daprPort = process.env.DAPR_HTTP_PORT || "3593";
const baseURL = `http://localhost:${daprPort}/v1.0-alpha1/search/searchstore/indexes`;

// Wait for writes to complete before reading; acceptance alone does not guarantee success.
const writeOptions = {
  mode: "INDEXING_MODE_WAIT_FOR_COMPLETION",
  waitTimeout: "5s",
  onWaitTimeout: "INDEXING_WAIT_TIMEOUT_ACTION_FAIL_REQUEST",
};

async function main() {
  await request(indexName, "POST", {});
  console.log(`Created index: ${indexName}`);

  try {
    const indexed = await post(`${indexName}/documents`, {
      documents: documents.map(({ id, content }) => ({
        id,
        content: Buffer.from(JSON.stringify(content), "utf8").toString("base64"),
      })),
      options: writeOptions,
    });
    assert.deepEqual(indexed.failedItems, [], "Indexing returned document failures");
    checkCompleted(indexed.ack);
    console.log(`Indexed: ${documents.length} products`);

    const retrieved = await post(`${indexName}/documents/get`, {
      ids: ["1"],
      includeContent: true,
    });
    assert.equal(retrieved.documents.length, 1, "Expected exactly one retrieved product");
    const retrievedProduct = checkProduct(retrieved.documents[0]);
    console.log(`Retrieved: ${retrievedProduct.title}`);

    const result = await post(`${indexName}/query`, {
      query: { text: "Dapr", searchFields: ["title"], includeContent: true },
    });
    assert.equal(result.hits.length, 1, "Expected exactly one product matching Dapr");
    const matchedProduct = checkProduct(result.hits[0].document);
    console.log(`Search match: ${matchedProduct.title}`);

    const deleted = await post(`${indexName}/documents/delete`, {
      ids: documents.map(({ id }) => id),
      options: writeOptions,
    });
    checkCompleted(deleted.ack);
    console.log(`Deleted: ${documents.length} products`);

    // Omitting the query matches every document, not just the earlier text.
    const remaining = await post(`${indexName}/query`, {});
    assert.equal(remaining.hits.length, 0, "Deleted products are still searchable");
    console.log(`Remaining search matches: ${remaining.hits.length}`);
  } finally {
    await request(indexName, "DELETE");
    console.log(`Deleted index: ${indexName}`);
  }
}

async function request(path, method, body) {
  const response = await fetch(`${baseURL}/${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} failed (${response.status}): ${await response.text()}`);
  }
  return response;
}

async function post(path, body) {
  const response = await request(path, "POST", body);
  return response.json();
}

function checkProduct(document) {
  // Protobuf JSON represents document content as base64-encoded UTF-8 JSON.
  const product = JSON.parse(Buffer.from(document.content, "base64").toString("utf8"));
  assert.equal(document.id, "1", "Unexpected product ID");
  assert.deepEqual(product, cookbook, "Returned content differs from the indexed product");
  return product;
}

function checkCompleted(ack) {
  assert.equal(ack, "INDEX_ACK_COMPLETED", "Expected a completed write");
}

main().catch((error) => {
  console.error("Search failed:", error);
  process.exitCode = 1;
});
