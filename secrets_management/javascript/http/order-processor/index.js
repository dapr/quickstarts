import axios from "axios";

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";
const DAPR_SECRET_STORE = "localsecretstore";
const SECRET_NAME = "secret";

async function main() {
  // Get secret from a local secret store
  const secret = await axios.get(`${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/secrets/${DAPR_SECRET_STORE}/${SECRET_NAME}`);
  console.log("Fetched Secret: ", secret.data);
}

main().catch(e => console.error(e))