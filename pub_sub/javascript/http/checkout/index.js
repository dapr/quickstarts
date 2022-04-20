import axios from "axios";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";
const PUBSUB_NAME = "orderpubsub";
const PUBSUB_TOPIC = "orders";

async function main() {
  for(var i = 1; i <= 10; i++) {
    const order = {orderId: i};

    // Publish an event using Dapr pub/sub
    await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/publish/${PUBSUB_NAME}/${PUBSUB_TOPIC}`, order)
      .then(function (response) {
        console.log("Published data: " + response.config.data);
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