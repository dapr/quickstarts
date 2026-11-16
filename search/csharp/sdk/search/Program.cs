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

using Dapr.Search;

const string storeName = "searchstore";
const string indexName = "products";
var cookbook = new Product("Dapr cookbook", 29);
SearchDocument<Product>[] documents =
[
    new("1", cookbook),
    new("2", new Product(".NET services", 39)),
];

using var client = new DaprSearchClientBuilder()
    .UseTimeout(TimeSpan.FromSeconds(30))
    .Build();

// Wait for writes to complete before reading; acceptance alone does not guarantee success.
var writeOptions = new IndexingOptions
{
    Mode = IndexingMode.WaitForCompletion,
    WaitTimeout = TimeSpan.FromSeconds(5),
    OnWaitTimeout = IndexingWaitTimeoutAction.FailRequest,
};

await client.CreateIndexAsync(storeName, indexName);
Console.WriteLine($"Created index: {indexName}");

try
{
    var indexed = await client.IndexDocumentsAsync(storeName, indexName, documents, writeOptions);
    if (indexed.FailedItems.Count != 0)
    {
        throw new InvalidOperationException(
            $"Indexing failed: {string.Join("; ", indexed.FailedItems.Select(item => $"{item.Id}: {item.ErrorMessage}"))}");
    }

    CheckCompleted(indexed.Ack);
    Console.WriteLine($"Indexed: {documents.Length} products");

    var retrieved = await client.GetDocumentsAsync<Product>(storeName, indexName, ["1"], includeContent: true);
    if (retrieved.Count != 1)
    {
        throw new InvalidOperationException("Expected exactly one retrieved product.");
    }

    var retrievedProduct = CheckProduct(retrieved[0]);
    Console.WriteLine($"Retrieved: {retrievedProduct.Title}");

    var query = new SearchQuery
    {
        Text = "Dapr",
        SearchFields = ["title"],
        IncludeContent = true,
    };
    var result = await client.SearchAsync<Product>(storeName, indexName, query);
    if (result.Hits.Count != 1)
    {
        throw new InvalidOperationException("Expected exactly one product matching Dapr.");
    }

    var matchedProduct = CheckProduct(result.Hits[0].Document);
    Console.WriteLine($"Search match: {matchedProduct.Title}");

    var deleted = await client.DeleteDocumentsAsync(storeName, indexName, ["1", "2"], writeOptions);
    CheckCompleted(deleted);
    Console.WriteLine($"Deleted: {documents.Length} products");

    // An omitted query matches every document, not just those matching the earlier text.
    var remaining = await client.SearchAsync<Product>(storeName, indexName);
    if (remaining.Hits.Count != 0)
    {
        throw new InvalidOperationException("Deleted products are still searchable.");
    }

    Console.WriteLine($"Remaining search matches: {remaining.Hits.Count}");
}
finally
{
    await client.DeleteIndexAsync(storeName, indexName);
    Console.WriteLine($"Deleted index: {indexName}");
}

static void CheckCompleted(IndexAck ack)
{
    if (ack != IndexAck.Completed)
    {
        throw new InvalidOperationException($"Expected a completed write, received {ack}.");
    }
}

Product CheckProduct(SearchDocument<Product> document)
{
    if (document.Id != "1" || document.Content != cookbook)
    {
        throw new InvalidOperationException("The returned product does not match the indexed document.");
    }

    return document.Content;
}

public sealed record Product(string Title, int Price);
