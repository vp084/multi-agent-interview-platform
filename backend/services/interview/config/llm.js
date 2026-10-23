import { ChatGroq } from "@langchain/groq";
import dotenv from "dotenv";
dotenv.config();

const defaultModel = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export const createLlm = (maxTokens = undefined, model = defaultModel, temperature = 0.2, seed = 42) => {
    const config = {
        model,
        temperature,
        seed,
        modelKwargs: { seed },
        maxRetries: 2,
    };
    if (maxTokens) config.maxTokens = maxTokens;

    const primary = new ChatGroq(config);

    const fallback1 = new ChatGroq({
        model: "openai/gpt-oss-20b",
        temperature,
        seed,
        maxRetries: 2,
        ...(maxTokens ? { maxTokens } : {}),
    });

    const fallback2 = new ChatGroq({
        model: "qwen/qwen3.8-27b",
        temperature,
        seed,
        maxRetries: 2,
        ...(maxTokens ? { maxTokens } : {}),
    });

    return primary.withFallbacks([fallback1, fallback2]);
};

const llm = createLlm();

export default llm;