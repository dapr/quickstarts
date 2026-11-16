import { createHash } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const daprHost = process.env.DAPR_HOST ?? "127.0.0.1";
const daprPort = process.env.DAPR_HTTP_PORT ?? "3500";
const daprUrl = new URL(daprHost.includes("://") ? daprHost : `http://${daprHost}`);
daprUrl.port = daprPort;
const cryptoUrl = new URL("/v1.0-alpha1/crypto/localstorage/", daprUrl);
const testFileName = "sample.txt";

async function cryptoRequest(operation, body, headers = {}) {
  const response = await fetch(new URL(operation, cryptoUrl), {
    method: "PUT",
    headers: {
      "Content-Type": "application/octet-stream",
      ...headers,
    },
    body,
    // Node.js requires this option when the request body is a stream.
    duplex: "half",
  });

  if (!response.ok) {
    throw new Error(`Dapr ${operation} failed (${response.status}): ${await response.text()}`);
  }

  return response;
}

async function encryptDecryptBuffer() {
  const plaintext = Buffer.from('The secret is "passw0rd"', "utf8");

  console.log("== Encrypting message using buffers");
  const encryptResponse = await cryptoRequest("encrypt", plaintext, {
    "dapr-key-name": "rsa-private-key.pem",
    "dapr-key-wrap-algorithm": "RSA",
  });
  const encrypted = Buffer.from(await encryptResponse.arrayBuffer());
  console.log("Encrypted the message");

  console.log("== Decrypting message using buffers");
  const decryptResponse = await cryptoRequest("decrypt", encrypted);
  const decrypted = Buffer.from(await decryptResponse.arrayBuffer());
  console.log("Decrypted the message, got", decrypted.length, "bytes");
  console.log(decrypted.toString("utf8"));

  if (!decrypted.equals(plaintext)) {
    throw new Error("Decrypted message does not match original message");
  }
}

async function encryptDecryptStream() {
  console.log("== Encrypting message using streams");
  console.log("Encrypting", testFileName, "to encrypted.out");
  const encryptResponse = await cryptoRequest("encrypt", createReadStream(testFileName), {
    "dapr-key-name": "symmetric-key-256",
    "dapr-key-wrap-algorithm": "A256KW",
  });
  await pipeline(Readable.fromWeb(encryptResponse.body), createWriteStream("encrypted.out"));
  console.log("Encrypted the message to encrypted.out");

  console.log("== Decrypting message using streams");
  console.log("Decrypting encrypted.out to decrypted.out.txt");
  const decryptResponse = await cryptoRequest("decrypt", createReadStream("encrypted.out"));
  await pipeline(Readable.fromWeb(decryptResponse.body), createWriteStream("decrypted.out.txt"));
  console.log("Decrypted the message to decrypted.out.txt");

  if (await hashFile(testFileName) !== await hashFile("decrypted.out.txt")) {
    throw new Error("Decrypted file does not match original file");
  }
  console.log("Decrypted file matches original file");
}

async function hashFile(path) {
  const hash = createHash("sha256");
  await pipeline(createReadStream(path), hash);
  return hash.digest("hex");
}

await encryptDecryptBuffer();
await encryptDecryptStream();
console.log("HTTP round trips verified");
