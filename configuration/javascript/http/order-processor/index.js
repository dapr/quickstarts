import axios from "axios";
import express, { json } from "express";

const DAPR_HOST = process.env.DAPR_HOST ?? "localhost";

let DAPR_PORT = process.env.DAPR_HTTP_PORT ?? 3500;
let APP_PORT = process.env.APP_PORT ?? 6001;

const DAPR_CONFIGURATION_STORE = "configstore";
const BASE_URL = `http://${DAPR_HOST}:${DAPR_PORT}/v1.0-alpha1/configuration/${DAPR_CONFIGURATION_STORE}`;
const CONFIGURATION_ITEMS = ["orderId1", "orderId2"];

const app = express();
app.use(express.json());

async function main() {
  // Get config items from the config store
  CONFIGURATION_ITEMS.forEach((item) => {
    axios
      .get(`${BASE_URL}?key=${item}`)
      .then((response) => {
        console.log("Configuration for " + item + ":", response.data);
      })
      .catch((error) => {
        console.log("Could not get config item, err:" + error);
        process.exit(1);
      });
  });

  // Start server to receive config updates
  readConfigurationChanges();
  // Subscribe to config updates
  var subscriptionId = await subscribeToConfigUpdates();

  // Unsubscribe to config updates and exit app after 20 seconds
  setTimeout(async () => {
    await unsubscribeToConfigUpdates(subscriptionId);
    process.exit(0);
  }, 20000);
}

async function subscribeToConfigUpdates() {
  // Add delay to allow app channel to be ready
  await sleep(3000);
  // Subscribe to config updates
  try {
    const { data: response } = await axios.get(`${BASE_URL}/subscribe`);
    console.log("App subscribed to config changes with subscription id: ", response.id);
    return response.id;
  } catch (error) {
    console.log("Could not subscribe to config updates, err:" + error);
    process.exit(1);
  }
}

async function unsubscribeToConfigUpdates(subscriptionId) {
  try {
    const { data: response } = await axios.get(`${BASE_URL}/${subscriptionId}/unsubscribe`);
    if (JSON.stringify(response).includes("true")) {
      console.log("App unsubscribed from config changes");
    } else {
      console.log("Error unsubscribing to config updates, err:" + response);
    }
  } catch (error) {
    console.log("Error unsubscribing to config updates, err:" + error);
  }
}

async function readConfigurationChanges() {
  // Create POST endpoint to receive config updates
  app.post("/configuration/configstore/*", (req, res) => {
    console.log("Configuration update", JSON.stringify(req.body.items));
    res.sendStatus(200);
  });
  app.listen(APP_PORT, () => console.log("App listening for config updates"));
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((e) => console.error(e));
