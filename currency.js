import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import dotenv from "dotenv";
import axios from "axios";
//import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
//import { ChatPromptTemplate } from "@langchain/core/prompts";


dotenv.config();

const amdorenApiKey = process.env.AMDOREN_API_KEY;
const openaiApiKey = process.env.OPENAI_API_KEY;

const convertCurrencyTool = tool(
    async ({from, to, amount}) => {
        const url = `https://www.amdoren.com/api/currency.php?api_key=${amdorenApiKey}&from=${from}&to=${to}`;
        console.log("Tool called with:", {from,to,amount});
        console.log("returning conversion string...");
    
    try {
        const response = await axios.get(url);
        if(response.data.error){
            return `Error: ${response.data.error}`;
        }
        const rate = response.data.amount;
        const converted = (rate * amount).toFixed(2);
        return `${amount} ${from} is approximately ${converted} ${to}.`;
    } catch (error) {
        return `API Error: ${error.message}`;
        }
    },
    {
        name: "convert_currency",
        description: "Converts an amount from one currency to another using the Amdoren API.",
        schema: z.object({
            from: z.string().describe("3-letter source currency code like USD"),
            to: z.string().describe("3-letter target currency code like EUR"),
            amount: z.number().describe("Amount to convert"),
        }),
    }
);
//
//
async function runToolExample(){
    const llm = new ChatOpenAI({
        model: "gpt-3.5-turbo", //gemini-2.0-flash
        temperature: 0,
        apiKey: openaiApiKey,
    });

    const llmWithTools = llm.bindTools([convertCurrencyTool]);

    console.log("=== Example 1: Basic Tool Usage ===");
    const response1 = await llmWithTools.invoke([
        new HumanMessage("Please convert 100 USD to EUR.")
    ]);

    //console.log("AI Response:", response1.content);
    console.log("Tool calls:", response1.tool_calls);

    if (response1.tool_calls && response1.tool_calls.length > 0) {
    for (const toolCall of response1.tool_calls) {
        if (toolCall.name === "convert_currency") {
            const result = await convertCurrencyTool.invoke(toolCall.args);
            console.log("Tool result:", result);
        }
    }
}
}

//async function runAgentExample(){
//    const llm = new ChatOpenAI({
//        model: "gpt-3.5-turbo", //gemini-2.0-flash
//        temperature: 0,
//        apiKey: openaiApiKey,
//    });
//
//const prompt = ChatPromptTemplate.fromMessages([
//    ["system", "You are a helpful currency conversion assistant. Always use the result from the tool to answer the user's question."],
//    ["user", "{input}"],
//    ["assistant", "{agent_scratchpad}"],
//]);
//
//const agent = await createOpenAIFunctionsAgent({
//    llm,
//    tools: [convertCurrencyTool],
//    prompt,
//});
//
//const executor = AgentExecutor.fromAgentAndTools({
//    agent,
//    tools: [convertCurrencyTool],
//    verbose: true,
//});
//
//const input = "Please convert 100 USD to EUR.";
//const result = await executor.invoke({ input });
//
//
//console.log("\n=== Agent Execution Result ===");
//console.log(JSON.stringify(result, null, 2));
//console.log(result.output);
//
//}
async function main(){
    //const llmWithTools = llm.bindTools([convertCurrencyTool]);
    //console.log("\n=== Currency Conversion Example ===");
    //const result = await llmWithTools.invoke([
    //    new HumanMessage("Plesae convert 100 USD to EUR.")
    //]);
    //console.log("AI Response: ", result.content);

    try{
        await runToolExample();
    } catch (error) {
        console.error("Error running tool example:", error);
    }
}

main();


//async function convertCurrency(from, to, amount){
//    const url = `https://www.amdoren.com/api/currency.php?api_key=${amdorenApiKey}&from=${fromCurrency}&to=${toCurrency}`;
//
//    try {
//        const response = await axios.get(url);
//        const rate = response.data.amount;
//
//        if(response.data.error){
//            return `Error: ${response.data.error}`;
//        }
//
//        const converted = (rate * amount).toFixed(2);
//        return `${amount} ${from} is approximately ${converted} ${to}.`;
//    }catch (error) {
//        return `API Error: ${error.message}`;
//    }
//}


//const convertCurrencyTool = tool({
//    name: "convert_currency",
//    description: "Convert currency from one type to another using Amdoren API",
//    schema: z.object({
//        from: z.string().describe("Source currency code, e.g., USD"),
//        to: z.string().describe("Target currency code, e.g, EUR"),
//        amount: z.number().describe("Amount to convert"),
//    }),
//    func: async ({from, to, amount}) => {
//        return await convertCurrency({from, to, amount});
//    }
//});

    //async (input) => {
    //    return [{role: "user", content: input }];
    //},
    //model.bind({
    //    tools: [convertCurrencyTool],
    //    tool_choice: "auto",
//    }),
//};

//async function runBot(inputText){
//    const systemPrompt = `You are a helpful currency exchange assistant. Ask the user for their source currency, target currency, and amount, then help convert it using a currency API.`;
//
//    const messages = [
//        new SystemMessage(systemPrompt),
//        new HumanMessage(inputText),
//    ];
//
//    const response = await chat.invoke(messages);
//    const text = response.content;
//
//    const currencyMatch = text.match(/(\d+(\.\d+)?)[ ]?([A-Z]{3})[ ]?to[ ]?([A-Z]{3})/i);
//
//    if (!currencyMatch){
//        return `I couldn't find a valid currency conversion request in your message. Please use the format: "Convert [amount] [from currency] to [to currency]".`;
//    }
//
//    const amount = parseFloat(currencyMatch[1]);
//    const from = currencyMatch[3].toUpperCase();
//    const to = currencyMatch[4].toUpperCase();
//
//    return await convertCurrency(from, to, amount)
//}

//const userInput = "Convert 100 USD to EUR";
//chain.invoke(userInput).then((response) => {
//    console.log("\n AI:", response.content || "No response");
//});

//runBot(userInput).then((output) => {
//    console.log(output);
//});