import axios from "axios";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";
const DAPR_STATE_STORE = 'statestore'

async function main() {
  for(var i = 1; i <= 10; i++) {
    const orderId = i;
    const order = {orderId: orderId}; 
    const state = [{
      key: orderId.toString(),
      value: order
    }];

    // Save state into a state store
    await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/state/${DAPR_STATE_STORE}`, state)
      .then(function (response) {
        console.log("Saving Order: " + response.config.data);
      });
      
    // Get state from a state store
    await axios.get(`${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/state/${DAPR_STATE_STORE}/${orderId.toString()}`)
      .then(function (response) {
        console.log("Getting Order: ", response.data);
      });

    // Save state into a state store
    await axios.delete(`${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/state/${DAPR_STATE_STORE}/${orderId.toString()}`, state)
      .then(function (response) {
        console.log("Deleting Order: " + JSON.stringify(order));
      });

    await sleep(1000);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(e => console.error(e))