import { createReadStream, createWriteStream } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { pipeline } from "node:stream/promises";

import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";

const daprHost = process.env.DAPR_HOST ?? "127.0.0.1";
const daprPort = process.env.DAPR_GRPC_PORT ?? "50001";

const testFileName = "federico-di-dio-photography-Q4g0Q-eVVEg-unsplash.jpg";

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  // Encrypt and decrypt a message from a buffer
  await encryptDecryptBuffer(client);

  // Encrypt and decrypt a message using streams
  await encryptDecryptStream(client);
}

async function encryptDecryptBuffer(client) {
  // Message to encrypt
  const plaintext = `The secret is "passw0rd"`

  // First, encrypt the message
  console.log("== Encrypting message using buffers");

  const ciphertext = await client.crypto.encrypt(plaintext, {
    componentName: "crypto-local",
    keyName: "my-rsa-key",
    keyWrapAlgorithm: "RSA",
  });

  console.log("Encrypted the message, got", ciphertext.length, "bytes");

  // Decrypt the message
  console.log("== Decrypting message using buffers");
  const decrypted = await client.crypto.decrypt(ciphertext, {
    componentName: "crypto-local",
  });

  console.log("Decrypted the message, got", decrypted.length, "bytes");
  console.log(decrypted.toString("utf8"));

  // The contents should be equal
  if (decrypted.toString("utf8") != plaintext) {
    throw new Error("Decrypted message does not match original message");
  }
}

async function encryptDecryptStream(client) {
  // First, encrypt the message
  console.log("== Encrypting message using streams");
  console.log("Encrypting", testFileName, "to ciphertext.out");

  await pipeline(
    createReadStream(testFileName),
    await client.crypto.encrypt({
      componentName: "crypto-local",
      keyName: "symmetric256",
      keyWrapAlgorithm: "A256KW",
    }),
    createWriteStream("ciphertext.out"),
  );

  console.log("Encrypted the message to ciphertext.out");

  // Decrypt the message
  console.log("== Decrypting message using streams");
  console.log("Encrypting ciphertext.out to plaintext.out");
  await pipeline(
    createReadStream("ciphertext.out"),
    await client.crypto.decrypt({
      componentName: "crypto-local",
    }),
    createWriteStream("plaintext.out.jpg"),
  );

  console.log("Decrypted the message to plaintext.out.jpg");
}

await start();
