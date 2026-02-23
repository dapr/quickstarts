const conversationComponentName = "ollama";

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
      parameters: {},
      metadata: {},
      response_format: {
        type: "object",
        properties: { answer: { type: "string" } },
        required: ["answer"],
      },
      prompt_cache_retention: "86400s",
    };
    const response = await fetch(reqURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(converseInputBody),
    });

    console.log("Conversation input sent: What is dapr?");

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data || !data.outputs || !Array.isArray(data.outputs) || data.outputs.length === 0) {
      throw new Error(`Response does not contain 'outputs' array. Response: ${JSON.stringify(data)}`);
    }
    
    const output = data.outputs[0];
    if (output.model) {
      console.log("Model:", output.model);
    }
    if (output.usage) {
      const u = output.usage;
      console.log(
        `Usage: prompt_tokens=${u.promptTokens} completion_tokens=${u.completionTokens} total_tokens=${u.totalTokens}`
      );
    }
    if (!output.choices || !Array.isArray(output.choices) || output.choices.length === 0) {
      throw new Error(`Output does not contain 'choices' array. Output: ${JSON.stringify(output)}`);
    }
    
    const choice = output.choices[0];
    if (!choice || !choice.message || !choice.message.content) {
      throw new Error(`Choice does not contain 'message.content'. Choice: ${JSON.stringify(choice)}`);
    }
    
    const result = choice.message.content;
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
      metadata: {},
      response_format: {
        type: "object",
        properties: { answer: { type: "string" } },
        required: ["answer"],
      },
      prompt_cache_retention: "86400s",
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
      toolChoice: "auto",
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data || !data.outputs || !Array.isArray(data.outputs) || data.outputs.length === 0) {
      throw new Error(`Response does not contain 'outputs' array. Response: ${JSON.stringify(data)}`);
    }
    
    const output = data.outputs[0];
    if (output?.usage) {
      const u = output.usage;
      console.log(
        `Usage: prompt_tokens=${u.promptTokens} completion_tokens=${u.completionTokens} total_tokens=${u.totalTokens}`
      );
    }

    if (!output.choices || !Array.isArray(output.choices) || output.choices.length === 0) {
      throw new Error(`Output does not contain 'choices' array. Output: ${JSON.stringify(output)}`);
    }
    
    const choice = output.choices[0];
    if (!choice || !choice.message) {
      throw new Error(`Choice does not contain 'message'. Choice: ${JSON.stringify(choice)}`);
    }
    
    const message = choice.message;
    const result = message.content;
    if (result) {
      console.log("Output message:", result);
    }

    if (message.toolCalls) {
      console.log("Tool calls detected:");
      for (const toolCall of message.toolCalls) {
        const functionName = toolCall.function?.name;
        const functionArgs = toolCall.function?.arguments;
        console.log(`  Function: ${functionName}`);
        console.log(`  Arguments: ${functionArgs}`);
      }
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
