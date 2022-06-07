import { DaprClient } from '@dapr/dapr'

const DAPR_PROTOCOL = process.env.DAPR_PROTOCOL ?? "http"
const DAPR_HOST = process.env.DAPR_HOST ?? "localhost"

let PORT
switch (DAPR_PROTOCOL) {
    case "http": {
        PORT = process.env.DAPR_HTTP_PORT
        break
    }
    case "grpc": {
        PORT = process.env.DAPR_GRPC_PORT
        break
    }
    default: {
        PORT = 3500
    }
}

const DAPR_STATE_STORE_NAME = "statestore"

async function main() {
    const host = `${DAPR_PROTOCOL}://${DAPR_HOST}`
    const client = new DaprClient(host, PORT)

    // For each loop, Save order, Get order, and Delete order
    for (let i = 1; i <= 10; i++) {
        const orderId = i.toString()
        const order = { orderId }
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
        const savedOrder = await client.state.get(DAPR_STATE_STORE_NAME, orderId)
        console.log("Getting Order: ", savedOrder)

        // Delete state from the state store
        await client.state.delete(DAPR_STATE_STORE_NAME, orderId)
        console.log("Deleting Order: ", order)

        await sleep(1000)
    }
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(e => console.error(e))