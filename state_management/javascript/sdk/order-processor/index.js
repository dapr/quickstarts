import { DaprClient } from 'dapr-client'

const DAPR_HOST = process.env.DAPR_HOST ?? "http://localhost"
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT ?? "3500"
const DAPR_STATE_STORE_NAME = "statestore"

async function main() {
    const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT)

    // For each loop, Save order, Get order, and Delete order
    for (var i = 1; i <= 10; i++) {
        const orderId = i.toString()
        const order = { orderId }
        const state = [
            {
                key: order.orderId.toString(),
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