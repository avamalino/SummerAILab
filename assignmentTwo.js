import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dotev from "dotenv";
dotev.config();


const multiply = tool(
    ({a,b}) => {
        return a*b;
    },
    {
        name : "multiply",
        description: "Multiply two numbers",
        schema: z.object({
            a: z.number(),
            b: z.number(),
        }),
    }
);

const remainder = tool(
    ({a,b}) => {
        if (b === 0){
            throw new Error("can't divide by zero");
        }
        return a % b;
    },
    {
        name: "remainder",
        description: "Find the remainder of two numbers",
        schema: z.object({
            a: z.number(),
            b: z.number(),
        }),
    }
);

async function runToolExample(){
    const llm = new ChatOpenAI({
        model: "gpt-3.5-turbo", //gemini-2.0-flash
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
    });

    const llmWithTools = llm.bindTools([multiply, remainder]);

    console.log("=== Example 1: Basic Tool Usage ===");
    const response1 = await llmWithTools.invoke([
        new HumanMessage("What is 7 multiplied by 50?")
    ]);

    console.log("AI Response:", response1.content);
    console.log("Tool calls:", response1.tool_calls);
    
    console.log("=== Example 2: Manual Tool Execution ===");
    const response2 = await llmWithTools.invoke([
        new HumanMessage("What is the remainder of 15 divided by 4?")
    ]);

    if (response2.tool_calls && response2.tool_calls.length > 0){
        console.log("AI wants to use tools:", response2.tool_calls);

        const toolResults = [];
        for (const toolCall of response2.tool_calls){
            let result;
            if (toolCall.name === "multiply"){
                result = await multiply.invoke(toolCall.args);
            } else if (toolCall.name === "remainder"){
                result = await remainder.invoke(toolCall.args);
            }

            toolResults.push({
                tool: toolCall.name,
                args: toolCall.args,
                result: result
            });

            console.log(`${toolCall.name}(${JSON.stringify(toolCall.args)}) = ${result}`);
        }
    }

    console.log("\n===Example 3: Conversational Tool Usage ===");

    const messages = [
        new HumanMessage("I need to calculate the area of a rectangle that is 25 units wide and 18 units tall")
    ];

    const response3 = await llmWithTools.invoke(messages);
    console.log("AI Response:", response3.content);

    if (response3.tool_calls && response3.tool_calls.length > 0){
        for (const toolCall of response3.tool_calls){
            if (toolCall.name === "multiply"){
                const result = await multiply.invoke(toolCall.args);
                console.log(`Area calculation: ${toolCall.args.a} * ${toolCall.args.b} = ${result} square units`);
            }
        }
    }
}

async function runWithErrorHandling(){
    console.log("\n=== Example 4: Error Handling ===");

    const llm = new ChatOpenAI({
        model: "gpt-3.5-turbo", //gemini-2.0-flash
        temperature: 0,
        apiKey: process.env.OPENAI_API_KEY,
    });

    const llmWithTools = llm.bindTools([multiply, remainder]);

    try {
        const response = await llmWithTools.invoke([
            new HumanMessage("What is the remainder of 15 divided by 15?")
        ]);

        if (response.tool_calls && response.tool_calls.length > 0){
            for (const toolCall of response.tool_calls){
                try {
                    if (toolCall.name === "remainder"){
                        const result = await remainder.invoke(toolCall.args);
                        console.log(`Result: ${result}`);
                    }
                } catch (error) {
                    console.error(`Tool execution error: ${error.message}`);
                }
            }
        }
    } catch (error){
        console.error(`LLM error: ${error.message}`);
    }
}

async function main() {
  try {
    await runToolExample();
    await runWithErrorHandling();
  } catch (error) {
    console.error("Error running examples:", error);
    console.log("\nMake sure to:");
    console.log("1. Install dependencies: npm install @langchain/openai @langchain/core zod");
    console.log("2. Set your OpenAI API key: export OPENAI_API_KEY=your-key-here");
  }
}

main();

//const response = await multiply.invoke({a: 2, b: 3});

//console.log(response.content);
//console.log(multiply.name);
//console.log(multiply.description);
//console.log(multiply.z);