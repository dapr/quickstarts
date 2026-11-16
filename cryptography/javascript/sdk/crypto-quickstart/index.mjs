import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";

const daprHost = process.env.DAPR_HOST ?? "127.0.0.1";

const testFileName = "federico-di-dio-photography-Q4g0Q-eVVEg-unsplash.jpg";

async function start() {
  for (const communicationProtocol of [CommunicationProtocolEnum.GRPC, CommunicationProtocolEnum.HTTP]) {
    const useGrpc = communicationProtocol === CommunicationProtocolEnum.GRPC;
    console.log(`== Using ${useGrpc ? "gRPC" : "HTTP"}`);
    const client = new DaprClient({
      daprHost,
      daprPort: useGrpc
        ? process.env.DAPR_GRPC_PORT ?? "50001"
        : process.env.DAPR_HTTP_PORT ?? "3500",
      communicationProtocol,
    });

    try {
      await encryptDecryptBuffer(client);
      await encryptDecryptStream(client);
      console.log(`${useGrpc ? "gRPC" : "HTTP"} round trips verified`);
    } finally {
      await client.stop();
    }
  }
}

async function encryptDecryptBuffer(client) {
  // Message to encrypt
  const plaintext = Buffer.from('The secret is "passw0rd"', "utf8");

  // First, encrypt the message
  console.log("== Encrypting message using buffers");

  const encrypted = await client.crypto.encrypt(plaintext, {
    componentName: "localstorage",
    keyName: "rsa-private-key.pem",
    keyWrapAlgorithm: "RSA",
  });

  console.log("Encrypted the message");

  // Decrypt the message
  console.log("== Decrypting message using buffers");
  const decrypted = await client.crypto.decrypt(encrypted, {
    componentName: "localstorage",
  });

  console.log("Decrypted the message, got", decrypted.length, "bytes");
  console.log(decrypted.toString("utf8"));

  // The contents should be equal
  if (!decrypted.equals(plaintext)) {
    throw new Error("Decrypted message does not match original message");
  }
}

async function encryptDecryptStream(client) {
  // First, encrypt the message
  console.log("== Encrypting message using streams");
  console.log("Encrypting", testFileName, "to encrypted.out");

  await pipeline(
    createReadStream(testFileName),
    await client.crypto.encrypt({
      componentName: "localstorage",
      keyName: "symmetric-key-256",
      keyWrapAlgorithm: "A256KW",
    }),
    createWriteStream("encrypted.out"),
  );

  console.log("Encrypted the message to encrypted.out");

  // Decrypt the message
  console.log("== Decrypting message using streams");
  console.log("Decrypting encrypted.out to decrypted.out.jpg");
  await pipeline(
    createReadStream("encrypted.out"),
    await client.crypto.decrypt({
      componentName: "localstorage",
    }),
    createWriteStream("decrypted.out.jpg"),
  );

  console.log("Decrypted the message to decrypted.out.jpg");

  if (await hashFile(testFileName) !== await hashFile("decrypted.out.jpg")) {
    throw new Error("Decrypted file does not match original file");
  }
  console.log("Decrypted file matches original file");
}

async function hashFile(path) {
  const hash = createHash("sha256");
  await pipeline(createReadStream(path), hash);
  return hash.digest("hex");
}

// Start the code
await start();
