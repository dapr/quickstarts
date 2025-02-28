const conversationComponentName = "echo";

async function main() {
  const daprHost = process.env.DAPR_HOST || "http://localhost";
  const daprHttpPort = process.env.DAPR_HTTP_PORT || "3500";

  const inputBody = {
    name: "echo",
    inputs: [{ content: "What is dapr?" }],
    parameters: {},
    metadata: {},
  };

  const reqURL = `${daprHost}:${daprHttpPort}/v1.0-alpha1/conversation/${conversationComponentName}/converse`;

  try {
    const response = await fetch(reqURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(inputBody),
    });

    console.log("Input sent: What is dapr?");

    const data = await response.json();
    const result = data.outputs[0].result;
    console.log("Output response:", result);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
