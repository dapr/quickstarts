import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr"

const communicationProtocol = (process.env.DAPR_PROTOCOL === "grpc")
    ? CommunicationProtocolEnum.GRPC
    : CommunicationProtocolEnum.HTTP

const daprHost = process.env.DAPR_HOST ?? "localhost"

let daprPort
switch (communicationProtocol) {
    case CommunicationProtocolEnum.HTTP: {
        daprPort = process.env.DAPR_HTTP_PORT
        break
    }
    case CommunicationProtocolEnum.GRPC: {
        daprPort = process.env.DAPR_GRPC_PORT
        break
    }
    default: {
        port = 3500
    }
}

const DAPR_STATE_STORE_NAME = "statestore"

async function main() {
    const client = new DaprClient({ daprHost, daprPort, communicationProtocol })

    // For each loop, Save order, Get order, and Delete order
    for (let i = 1; i <= 100; i++) {
        const order = { orderId: i.toString() }
        const state = [
            {
                key: order.orderId,
                value: order
            }
        ]

        // Save state into a state store
        await client.state.save(DAPR_STATE_STORE_NAME, state)
        console.log("Saving Order: ", order)

        // Get state from a state store
        const savedOrder = await client.state.get(DAPR_STATE_STORE_NAME, order.orderId)
        console.log("Getting Order: ", savedOrder)

        // Delete state from the state store
        await client.state.delete(DAPR_STATE_STORE_NAME, order.orderId)
        console.log("Deleting Order: ", order)

        await sleep(500)
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(e => console.error(e))
