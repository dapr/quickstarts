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

using System.Net.Http.Headers;
using System.Text;

const string fileName = "greeting.txt";
const string initialText = "Hello from the Dapr binary store!";
const string updatedText = "Updated binary store file.";

using var httpClient = new HttpClient
{
    BaseAddress = new Uri("http://localhost:3590/v1.0-alpha1/binarystore/binarystore/"),
};

await StoreFileAsync(HttpMethod.Post, initialText);
Console.WriteLine($"Stored: {fileName}");

var downloadedText = await GetFileAsync();
Console.WriteLine($"Downloaded: {downloadedText}");

await StoreFileAsync(HttpMethod.Put, updatedText);
Console.WriteLine($"Overwritten: {fileName}");

downloadedText = await GetFileAsync();
if (downloadedText != updatedText)
{
    throw new InvalidOperationException("The downloaded file does not match the updated content.");
}

Console.WriteLine($"Downloaded updated content: {downloadedText}");

using var deleteResponse = await httpClient.DeleteAsync(fileName);
deleteResponse.EnsureSuccessStatusCode();
Console.WriteLine($"Deleted: {fileName}");

async Task StoreFileAsync(HttpMethod method, string text)
{
    using var request = new HttpRequestMessage(method, fileName)
    {
        Content = new ByteArrayContent(Encoding.UTF8.GetBytes(text)),
    };
    request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

    using var response = await httpClient.SendAsync(request);
    response.EnsureSuccessStatusCode();
}

async Task<string> GetFileAsync()
{
    using var response = await httpClient.GetAsync(fileName);
    response.EnsureSuccessStatusCode();
    return Encoding.UTF8.GetString(await response.Content.ReadAsByteArrayAsync());
}
