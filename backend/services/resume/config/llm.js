import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
dotenv.config();

const primaryModel = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";

const primary = new ChatGroq({
    model: primaryModel,
    temperature: 0.2,
    maxTokens: 2500,
    maxRetries: 2,
});

const fallback = new ChatGroq({
    model: primaryModel === "openai/gpt-oss-120b" ? "qwen/qwen3.8-27b" : "openai/gpt-oss-120b",
    temperature: 0.2,
    maxTokens: 2500,
    maxRetries: 2,
});

const llm = primary.withFallbacks([fallback]);

export default llm;