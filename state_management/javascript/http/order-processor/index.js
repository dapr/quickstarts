import axios from "axios"

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
  }
  default: {
    PORT = 3500
  }
}

const DAPR_STATE_STORE_NAME = 'statestore'
const stateStoreBaseUrl = `${DAPR_PROTOCOL}://${DAPR_HOST}:${PORT}/v1.0/state/${DAPR_STATE_STORE_NAME}`

async function main() {
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