import { CommunicationProtocolEnum, DaprClient, Temporal } from "@dapr/dapr";

const conversationComponentName = "ollama";

async function main() {
  const daprHost = process.env.DAPR_HOST || "localhost";
  const daprPort = process.env.DAPR_HTTP_PORT || "3500";
  const client = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.HTTP,
  });

  try {
    // Plain conversation
    const response = await client.conversation.converse({
      name: conversationComponentName,
      inputs: [
        {
          messages: [
            {
              ofUser: {
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
      responseFormat: {
        type: "object",
        properties: { answer: { type: "string" } },
        required: ["answer"],
      },
      promptCacheRetention: Temporal.Duration.from({ seconds: 86400 }),
    });

    console.log("Conversation input sent: What is dapr?");

    const output = response.outputs[0];
    if (!output) {
      throw new Error(`Response does not contain an output. Response: ${JSON.stringify(response)}`);
    }
    if (output.model) {
      console.log("Model:", output.model);
    }
    if (output.usage) {
      const u = output.usage;
      console.log(
        `Usage: prompt_tokens=${u.promptTokens} completion_tokens=${u.completionTokens} total_tokens=${u.totalTokens}`
      );
    }

    const result = output.choices[0]?.message?.content;
    if (!result) {
      throw new Error(`Output does not contain 'message.content'. Output: ${JSON.stringify(output)}`);
    }
    const parsedResult = JSON.parse(result);
    if (typeof parsedResult?.answer !== "string" || !parsedResult.answer.trim()) {
      throw new Error(`Response does not contain a nonempty 'answer' string. Response: ${result}`);
    }
    console.log("Output response:", result);

    // Tool calling
    const toolCallingResponse = await client.conversation.converse({
      name: conversationComponentName,
      inputs: [
        {
          messages: [
            {
              ofUser: {
                content: [
                  {
                    text: "What is the weather like in San Francisco in celsius?",
                  },
                ],
              },
            },
          ],
          scrubPii: false,
        },
      ],
      scrubPii: false,
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
      toolChoice: "required",
    });

    console.log(
      "Tool calling input sent: What is the weather like in San Francisco in celsius?"
    );

    const toolCallingOutput = toolCallingResponse.outputs[0];
    if (!toolCallingOutput) {
      throw new Error(`Response does not contain an output. Response: ${JSON.stringify(toolCallingResponse)}`);
    }
    if (toolCallingOutput.usage) {
      const u = toolCallingOutput.usage;
      console.log(
        `Usage: prompt_tokens=${u.promptTokens} completion_tokens=${u.completionTokens} total_tokens=${u.totalTokens}`
      );
    }

    const message = toolCallingOutput.choices[0]?.message;
    if (message?.content) {
      console.log("Output message:", message.content);
    }
    if (!message?.toolCalls?.length) {
      throw new Error(`Output does not contain tool calls. Output: ${JSON.stringify(toolCallingOutput)}`);
    }

    console.log("Tool calls detected:");
    for (const toolCall of message.toolCalls) {
      console.log(`  Function: ${toolCall.function.name}`);
      console.log(`  Arguments: ${toolCall.function.arguments}`);
    }
  } finally {
    await client.stop();
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exitCode = 1;
});
