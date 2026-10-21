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

import { Writable } from "node:stream";
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

const storeName = "binarystore";
const fileName = "greeting.txt";
const initialContent = Buffer.from("Hello from the Dapr binary store!", "utf8");
const updatedContent = Buffer.from("Updated binary store file.", "utf8");

async function main() {
  const client = new DaprClient({
    daprHost: process.env.DAPR_HOST ?? "localhost",
    daprPort: process.env.DAPR_GRPC_PORT ?? "50091",
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  try {
    await client.start();

    await client.binaryStore.setBinaryFile(storeName, fileName, initialContent);
    console.log(`Stored: ${fileName}`);

    let downloadedContent = await client.binaryStore.getBinaryFileBytes(storeName, fileName);
    if (!downloadedContent.equals(initialContent)) {
      throw new Error("The downloaded file does not match the initial content.");
    }
    console.log(`Downloaded: ${downloadedContent.toString("utf8")}`);

    await client.binaryStore.setBinaryFile(storeName, fileName, updatedContent, { overwrite: true });
    console.log(`Overwritten: ${fileName}`);

    const chunks = [];
    const destination = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      },
    });
    await client.binaryStore.getBinaryFile(storeName, fileName, destination);
    downloadedContent = Buffer.concat(chunks);
    if (!downloadedContent.equals(updatedContent)) {
      throw new Error("The downloaded file does not match the updated content.");
    }
    console.log(`Downloaded updated content: ${downloadedContent.toString("utf8")}`);

    await client.binaryStore.deleteBinaryFile(storeName, fileName);
    console.log(`Deleted: ${fileName}`);
  } finally {
    await client.stop();
  }
}

main().catch((error) => {
  console.error("Binary store quickstart failed:", error);
  process.exitCode = 1;
});
