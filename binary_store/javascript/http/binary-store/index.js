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

const fileName = "greeting.txt";
const initialContent = Buffer.from("Hello from the Dapr binary store!", "utf8");
const updatedContent = Buffer.from("Updated binary store file.", "utf8");
const daprHost = process.env.DAPR_HOST ?? "http://localhost";
const daprHttpPort = process.env.DAPR_HTTP_PORT ?? "3590";
const fileUrl = `${daprHost}:${daprHttpPort}/v1.0-alpha1/binarystore/binarystore/${fileName}`;

async function main() {
  await storeFile("POST", initialContent);
  console.log(`Stored: ${fileName}`);

  let downloadedContent = await getFile();
  if (!downloadedContent.equals(initialContent)) {
    throw new Error("The downloaded file does not match the initial content.");
  }
  console.log(`Downloaded: ${downloadedContent.toString("utf8")}`);

  await storeFile("PUT", updatedContent);
  console.log(`Overwritten: ${fileName}`);

  downloadedContent = await getFile();
  if (!downloadedContent.equals(updatedContent)) {
    throw new Error("The downloaded file does not match the updated content.");
  }
  console.log(`Downloaded updated content: ${downloadedContent.toString("utf8")}`);

  await request({ method: "DELETE" });
  console.log(`Deleted: ${fileName}`);
}

async function storeFile(method, content) {
  await request({
    method,
    headers: { "Content-Type": "application/octet-stream" },
    body: content,
  });
}

async function getFile() {
  const response = await request({ method: "GET" });
  return Buffer.from(await response.arrayBuffer());
}

async function request(options) {
  const response = await fetch(fileUrl, options);
  if (!response.ok) {
    throw new Error(`${options.method} ${fileName} failed (${response.status}): ${await response.text()}`);
  }
  return response;
}

main().catch((error) => {
  console.error("Binary store quickstart failed:", error);
  process.exitCode = 1;
});
