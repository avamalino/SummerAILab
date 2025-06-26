import 'dotenv/config';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

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

const response = await model.invoke(messages);
console.log(response.content);