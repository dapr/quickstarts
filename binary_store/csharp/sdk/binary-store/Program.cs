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

using System.Text;
using Dapr.BinaryStore;
using Dapr.BinaryStore.Extensions;
using Microsoft.Extensions.DependencyInjection;

const string fileName = "greeting.txt";
const string initialText = "Hello from the Dapr binary store!";
const string updatedText = "Updated binary store file.";

var services = new ServiceCollection();
services.AddDaprBinaryStoreClient()
    .WithDocumentStore();

await using var serviceProvider = services.BuildServiceProvider();
var documentStore = serviceProvider.GetRequiredService<IDocumentStore>();

var initialContent = Encoding.UTF8.GetBytes(initialText);
await documentStore.SetBinaryFileAsync(fileName, initialContent.AsMemory());
Console.WriteLine($"Stored: {fileName}");

var downloadedContent = await documentStore.GetBinaryFileBytesAsync(fileName);
Console.WriteLine($"Downloaded: {Encoding.UTF8.GetString(downloadedContent)}");

var updatedContent = Encoding.UTF8.GetBytes(updatedText);
await documentStore.SetBinaryFileAsync(fileName, updatedContent.AsMemory(), overwrite: true);
Console.WriteLine($"Overwritten: {fileName}");

using var destination = new MemoryStream();
await documentStore.GetBinaryFileAsync(fileName, destination);
if (!updatedContent.SequenceEqual(destination.ToArray()))
{
    throw new InvalidOperationException("The downloaded file does not match the updated content.");
}

Console.WriteLine($"Downloaded updated content: {Encoding.UTF8.GetString(destination.ToArray())}");

await documentStore.DeleteBinaryFileAsync(fileName);
Console.WriteLine($"Deleted: {fileName}");
