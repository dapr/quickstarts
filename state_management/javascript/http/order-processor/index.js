import assert from "node:assert/strict"
import axios from "axios"

const protocol = process.env.DAPR_PROTOCOL ?? "http"
const DAPR_HOST = process.env.DAPR_HOST ?? "localhost"

let port  
switch (protocol) {
  case "http": {
    port = process.env.DAPR_HTTP_PORT ?? 3500
    break
  }
  case "grpc": {
    port = process.env.DAPR_GRPC_PORT
    break
  }
  default: {
    port = 3500
  }
}

const DAPR_STATE_STORE_NAME = 'statestore'
const stateStoreBaseUrl = `${protocol}://${DAPR_HOST}:${port}/v1.0/state/${DAPR_STATE_STORE_NAME}`

async function main() {
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
    await axios.post(`${stateStoreBaseUrl}`, state)
    console.log("Saving Order: ", order)

    // Get state from a state store
    const orderResponse = await axios.get(`${stateStoreBaseUrl}/${order.orderId}`)
    console.log("Getting Order: ", orderResponse.data)

    // Delete state from the state store
    await axios.delete(`${stateStoreBaseUrl}/${order.orderId}`)
    console.log("Deleting Order: ", order)

    await sleep(500)
  }

  const orders = [{ orderId: "bulk-1" }, { orderId: "bulk-2" }]
  const state = orders.map(order => ({ key: order.orderId, value: order }))
  await axios.post(stateStoreBaseUrl, state)

  for (const order of orders) {
    const response = await axios.get(`${stateStoreBaseUrl}/${order.orderId}`)
    assert.deepEqual(response.data, order, `Order ${order.orderId} was not saved`)
  }
  console.log("Saving bulk orders: bulk-1, bulk-2")

  // Dapr has no HTTP bulk-delete endpoint; delete each key in parallel.
  await Promise.all(orders.map(order =>
    axios.delete(`${stateStoreBaseUrl}/${encodeURIComponent(order.orderId)}`)
  ))

  for (const order of orders) {
    const response = await axios.get(`${stateStoreBaseUrl}/${order.orderId}`)
    assert.equal(response.status, 204, `Order ${order.orderId} was not deleted`)
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