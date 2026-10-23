import assert from "node:assert/strict"
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
        daprPort = 3500
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
        const saveResult = await client.state.save(DAPR_STATE_STORE_NAME, state)
        if (saveResult.error) throw saveResult.error
        console.log("Saving Order: ", order)

        // Get state from a state store
        const savedOrder = await client.state.get(DAPR_STATE_STORE_NAME, order.orderId)
        console.log("Getting Order: ", savedOrder)

        // Delete state from the state store
        const deleteResult = await client.state.delete(DAPR_STATE_STORE_NAME, order.orderId)
        if (deleteResult.error) throw deleteResult.error
        console.log("Deleting Order: ", order)

        await sleep(500)
    }

    const orders = [{ orderId: "bulk-1" }, { orderId: "bulk-2" }]
    const state = orders.map(order => ({ key: order.orderId, value: order }))
    const saveResult = await client.state.save(DAPR_STATE_STORE_NAME, state)
    if (saveResult.error) throw saveResult.error

    for (const order of orders) {
        const savedOrder = await client.state.get(DAPR_STATE_STORE_NAME, order.orderId)
        assert.deepEqual(savedOrder, order, `Order ${order.orderId} was not saved`)
    }
    console.log("Saving bulk orders: bulk-1, bulk-2")

    // Bulk deletion takes keys, not the saved values.
    const deleteResult = await client.state.deleteBulk(
        DAPR_STATE_STORE_NAME,
        orders.map(order => ({ key: order.orderId }))
    )
    if (deleteResult.error) throw deleteResult.error

    for (const order of orders) {
        const deletedOrder = await client.state.get(DAPR_STATE_STORE_NAME, order.orderId)
        assert.equal(deletedOrder, "", `Order ${order.orderId} was not deleted`)
    }
    console.log("Bulk orders deleted: bulk-1, bulk-2")
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(e => {
    console.error(e)
    process.exitCode = 1
})
