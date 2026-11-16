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

using System.Net.Http.Json;
using System.Text.Json;

const string indexName = "products";
var cookbook = new Product("Dapr cookbook", 29);
var documents = new[]
{
    new { id = "1", content = JsonSerializer.SerializeToUtf8Bytes(cookbook, JsonSerializerOptions.Web) },
    new { id = "2", content = JsonSerializer.SerializeToUtf8Bytes(new Product(".NET services", 39), JsonSerializerOptions.Web) },
};

var daprPort = Environment.GetEnvironmentVariable("DAPR_HTTP_PORT") ?? "3592";
using var httpClient = new HttpClient
{
    BaseAddress = new Uri($"http://localhost:{daprPort}/v1.0-alpha1/search/searchstore/indexes/"),
    Timeout = TimeSpan.FromSeconds(30),
};

// Wait for writes to complete before reading; acceptance alone does not guarantee success.
var writeOptions = new
{
    mode = "INDEXING_MODE_WAIT_FOR_COMPLETION",
    waitTimeout = "5s",
    onWaitTimeout = "INDEXING_WAIT_TIMEOUT_ACTION_FAIL_REQUEST",
};

using var createResponse = await httpClient.PostAsJsonAsync(indexName, new { });
createResponse.EnsureSuccessStatusCode();
Console.WriteLine($"Created index: {indexName}");

try
{
    using var indexingResult = await PostAsync($"{indexName}/documents", new { documents, options = writeOptions });
    var failedItems = indexingResult.RootElement.GetProperty("failedItems");
    if (failedItems.GetArrayLength() != 0)
    {
        throw new InvalidOperationException($"Indexing failed: {failedItems}");
    }

    CheckCompleted(indexingResult.RootElement);
    Console.WriteLine($"Indexed: {documents.Length} products");

    using var getResult = await PostAsync($"{indexName}/documents/get", new { ids = new[] { "1" }, includeContent = true });
    var retrievedDocuments = getResult.RootElement.GetProperty("documents");
    if (retrievedDocuments.GetArrayLength() != 1)
    {
        throw new InvalidOperationException("Expected exactly one retrieved product.");
    }

    var retrievedProduct = CheckProduct(retrievedDocuments[0]);
    Console.WriteLine($"Retrieved: {retrievedProduct.Title}");

    var query = new { text = "Dapr", searchFields = new[] { "title" }, includeContent = true };
    using var searchResult = await PostAsync($"{indexName}/query", new { query });
    var hits = searchResult.RootElement.GetProperty("hits");
    if (hits.GetArrayLength() != 1)
    {
        throw new InvalidOperationException("Expected exactly one product matching Dapr.");
    }

    var matchedProduct = CheckProduct(hits[0].GetProperty("document"));
    Console.WriteLine($"Search match: {matchedProduct.Title}");

    using var deleteResult = await PostAsync($"{indexName}/documents/delete", new
    {
        ids = new[] { "1", "2" },
        options = writeOptions,
    });
    CheckCompleted(deleteResult.RootElement);
    Console.WriteLine($"Deleted: {documents.Length} products");

    // An omitted query matches every document, not just those matching the earlier text.
    using var remainingResult = await PostAsync($"{indexName}/query", new { });
    var remainingHits = remainingResult.RootElement.GetProperty("hits").GetArrayLength();
    if (remainingHits != 0)
    {
        throw new InvalidOperationException("Deleted products are still searchable.");
    }

    Console.WriteLine($"Remaining search matches: {remainingHits}");
}
finally
{
    using var deleteIndexResponse = await httpClient.DeleteAsync(indexName);
    deleteIndexResponse.EnsureSuccessStatusCode();
    Console.WriteLine($"Deleted index: {indexName}");
}

async Task<JsonDocument> PostAsync<T>(string path, T body)
{
    using var response = await httpClient.PostAsJsonAsync(path, body);
    response.EnsureSuccessStatusCode();
    return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
}

static void CheckCompleted(JsonElement result)
{
    var ack = result.GetProperty("ack").GetString();
    if (ack != "INDEX_ACK_COMPLETED")
    {
        throw new InvalidOperationException($"Expected a completed write, received {ack}.");
    }
}

Product CheckProduct(JsonElement document)
{
    // The HTTP API represents document content as base64-encoded UTF-8 JSON bytes.
    var product = JsonSerializer.Deserialize<Product>(
        document.GetProperty("content").GetBytesFromBase64(), JsonSerializerOptions.Web);
    if (document.GetProperty("id").GetString() != "1" || product != cookbook)
    {
        throw new InvalidOperationException("The returned product does not match the indexed document.");
    }

    return product;
}

public sealed record Product(string Title, int Price);
