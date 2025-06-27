import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import readline from "readline";

const apiKey = process.env.GOOGLE_API_KEY;

const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
    apiKey: apiKey
});

const messages = [
    new SystemMessage("Translate the following from English into Italian"),
    new HumanMessage("hi!"),
];

var response = await model.invoke(messages);
console.log(response.content);
//3 below all the same
//await model.invoke("Hello");

//await model.invoke([{ role: "user", content: "Hello" }]);

//await model.invoke([new HumanMessage("hi!")]);

const stream = await model.stream(messages);

const chunks = [];
for await (const chunk of stream) {
    chunks.push(chunk);
    console.log(`${chunk.content}|`);
}


const systemTemplate = "Translate the folowing from English into {language} and include the romaji translation";

const promptTemplate = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["user", "{text}"],
]);

const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

r1.question("What would you like to translate to Japanese? ", async (userInput) => {
    console.log("User input:", userInput);

    const promptValue = await promptTemplate.invoke({
        language: "japanese",
        text: userInput,
    });

    response = await model.invoke(promptValue);
    console.log(`${response.content}`);

    r1.close();
});

