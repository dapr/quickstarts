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
// dapr run --app-id javascript-output-binding-http node output.js --components-path ../../components

import axios from "axios";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";
const KAFKA_TOPIC = process.env.DAPR_KAFKA_TOPIC || "sample-topic";

async function main() {
  for(var i = 1; i <= 10; i++) {
    const order = { data :
        {orderId: i},
        operation: "create"
    };
    // Publish a Kafka event using an output binding
    await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/bindings/${KAFKA_TOPIC}`, order)
      .then(function (response) {
        console.log("Javascript - Kafka HTTP output binding: " + response.config.data);
      })
      .catch(function (error) {
        console.log(error);
      });

    await sleep(1000);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(e => console.error(e))