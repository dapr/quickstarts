import axios from "axios";

const base_url = process.env.DAPR_HOST || "http://localhost" + ':' + process.env.DAPR_HTTP_PORT || "3500" 
const DAPR_SECRET_STORE = "localsecretstore";
const SECRET_NAME = "secret";

async function main() {
  // Get secret from a local secret store
  const secret = await axios.get(`${base_url}/v1.0/secrets/${DAPR_SECRET_STORE}/${SECRET_NAME}`);
  console.log("Fetched Secret: ", secret.data);
}

main().catch(e => console.error(e))