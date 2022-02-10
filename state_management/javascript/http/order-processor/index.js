import axios from "axios";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";
const DAPR_STATE_STORE = 'statestore'

async function main() {
  for (;;) {
    const order = {orderId: Math.floor(Math.random() * (1000 - 1) + 1)};
    // Save state into a state store
    const state = [{
      key: "orderId",
      value: order
    }];
    await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/state/${DAPR_STATE_STORE}`, state)
      .then(function (response) {
        console.log("Order requested: " + response.config.data);
      })
      .catch(function (error) {
        console.log(error);
      });
    // Get state from a state store
    await axios.get(`${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/state/${DAPR_STATE_STORE}/orderId`)
      .then(function (response) {
        console.log("Result after get: ", response.data);
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