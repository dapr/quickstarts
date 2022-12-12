import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

// JS SDK does not support Configuration API over HTTP protocol yet
const protocol = CommunicationProtocolEnum.GRPC;
const host = process.env.DAPR_HOST ?? "localhost";
const port = process.env.DAPR_GRPC_PORT ?? 3500;

const DAPR_CONFIGURATION_STORE = "configstore";
const CONFIGURATION_ITEMS = ["orderId1", "orderId2"];

async function main() {
  const client = new DaprClient(host, port, protocol);
  // Get config items from the config store
  try {
    const config = await client.configuration.get(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS);
    Object.keys(config.items).forEach((key) => {
      console.log("Configuration for " + key + ":", JSON.stringify(config.items[key]));
    });
  } catch (error) {
    console.log("Could not get config item, err:" + error);
    process.exit(1);
  }
  // Subscribe to config updates
  try {
    const stream = await client.configuration.subscribeWithKeys(
      DAPR_CONFIGURATION_STORE,
      CONFIGURATION_ITEMS,
      (config) => {
        console.log("Configuration update", JSON.stringify(config.items));
      }
    );
    // Unsubscribe to config updates and exit app after 20 seconds
    setTimeout(() => {
      stream.stop();
      console.log("App unsubscribed to config changes");
      process.exit(0);
    }, 20000);
  } catch (error) {
    console.log("Error subscribing to config updates, err:" + error);
    process.exit(1);
  }
}

main().catch((e) => console.error(e));
