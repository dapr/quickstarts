import axios from "axios";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";

async function main() {
  for(var i = 1; i <= 10; i++) {
    const order = {orderId: i};

    // Adding app id as part of th header
    let axiosConfig = {
      headers: {
          "dapr-app-id": "order-processor"
      }
    };

    // Invoking a service
    const res = await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/orders`, order , axiosConfig);
    console.log("Order passed: " + res.config.data);

    await sleep(1000);
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(e => console.error(e))