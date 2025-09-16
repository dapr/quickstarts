const conversationComponentName = "echo";

async function main() {
  const daprHost = process.env.DAPR_HOST || "http://localhost";
  const daprHttpPort = process.env.DAPR_HTTP_PORT || "3500";

  const reqURL = `${daprHost}:${daprHttpPort}/v1.0-alpha2/conversation/${conversationComponentName}/converse`;

  // Plain conversation
  try {
    const converseInputBody = {
      inputs: [
        {
          messages: [
            {
              of_user: {
                content: [
                  {
                    text: "What is dapr?",
                  },
                ],
              },
            },
          ],
        },
      ],
      parameters: {},
      metadata: {},
    };
    const response = await fetch(reqURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(converseInputBody),
    });

    console.log("Conversation input sent: What is dapr?");

    const data = await response.json();
    const result = data.outputs[0].choices[0].message.content;
    console.log("Output response:", result);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  // Tool calling
  try {
    const toolCallingInputBody = {
      inputs: [
        {
          messages: [
            {
              of_user: {
                content: [
                  {
                    text: "What is the weather like in San Francisco in celsius?",
                  },
                ],
              },
            },
          ],
          scrub_pii: false,
        },
      ],
      metadata: {
        api_key: "test-key",
        version: "1.0",
      },
      scrub_pii: false,
      temperature: 0.7,
      tools: [
        {
          function: {
            name: "get_weather",
            description: "Get the current weather for a location",
            parameters: {
              type: "object",
              properties: {
                location: {
                  type: "string",
                  description: "The city and state, e.g. San Francisco, CA",
                },
                unit: {
                  type: "string",
                  enum: ["celsius", "fahrenheit"],
                  description: "The temperature unit to use",
                },
              },
              required: ["location"],
            },
          },
        },
      ],
      tool_choice: "auto",
    };
    const response = await fetch(reqURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toolCallingInputBody),
    });

    console.log(
      "Tool calling input sent: What is the weather like in San Francisco in celsius?"
    );

    const data = await response.json();

    const result = data?.outputs?.[0]?.choices?.[0]?.message?.content;
    console.log("Output message:", result);

    if (data?.outputs?.[0]?.choices?.[0]?.message?.toolCalls) {
      console.log(
        "Tool calls detected:",
        JSON.stringify(data.outputs[0].choices[0].message?.toolCalls)
      );
    } else {
      console.log("No tool calls in response");
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
