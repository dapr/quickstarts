import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

const daprHost = "127.0.0.1"; 

async function main() {
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    const SECRET_STORE_NAME = "localsecretstore";
    var secret = await client.secret.get(SECRET_STORE_NAME, "secret");
    console.log("Result: " + secret);
    secret = await client.secret.getBulk(SECRET_STORE_NAME);
    console.log("Result for bulk: " + secret);
}

main();



