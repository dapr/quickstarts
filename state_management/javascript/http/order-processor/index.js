import axios from "axios"

const protocol = process.env.DAPR_PROTOCOL ?? "http"
const DAPR_HOST = process.env.DAPR_HOST ?? "localhost"

let port  
switch (protocol) {
  case "http": {
    port = process.env.DAPR_HTTP_PORT
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
    await axios.delete(`${stateStoreBaseUrl}/${order.orderId}`, state)
    console.log("Deleting Order: ", order)

    await sleep(500)
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(e => console.error(e))