import { DaprClient, CommunicationProtocolEnum } from '@dapr/dapr'; 

const DAPR_HOST = process.env.DAPR_HOST || "http://localhost";
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT || "3500";
const DAPR_SECRET_STORE = "localsecretstore";
const SECRET_NAME = "secret";

async function main() {
    const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const secret = await client.secret.get(DAPR_SECRET_STORE, SECRET_NAME);
    console.log("Fetched Secret: " + JSON.stringify(secret));
}

main().catch(e => console.error(e))