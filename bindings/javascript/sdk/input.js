/*
Copyright 2021 The Dapr Authors
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

import { DaprServer } from "dapr-client";

const daprHost = "127.0.0.1"; 
const daprPort = "5051"; 
const serverHost = "127.0.0.1";
const serverPort = "3500";

async function start() {
  const server = new DaprServer(serverHost, serverPort, daprHost, daprPort);;
  const bindingName = "sample-topic";
  const response = await server.binding.receive(bindingName, async (data) => console.log(`Javascript - Kafka SDK input binding: ${JSON.stringify(data)}`));
  await server.start();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});