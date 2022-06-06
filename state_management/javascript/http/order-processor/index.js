import axios from "axios"

const DAPR_HOST = process.env.DAPR_HOST ?? "http://localhost"
const DAPR_HTTP_PORT = process.env.DAPR_HTTP_PORT ?? "3500"
const DAPR_STATE_STORE_NAME = 'statestore'
const stateStoreBaseUrl = `${DAPR_HOST}:${DAPR_HTTP_PORT}/v1.0/state/${DAPR_STATE_STORE_NAME}`

async function main() {
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
    await axios.post(`${stateStoreBaseUrl}`, state)
    console.log("Saving Order: ", order)

    // Get state from a state store
    const orderResponse = await axios.get(`${stateStoreBaseUrl}/${orderId}`)
    console.log("Getting Order: ", orderResponse.data)

    // Delete state from the state store
    await axios.delete(`${stateStoreBaseUrl}/${orderId}`, state)
    console.log("Deleting Order: ", order)

    await sleep(1000)
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(e => console.error(e))