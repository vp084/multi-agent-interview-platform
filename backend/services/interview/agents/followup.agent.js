import { createLlm } from "../config/llm.js";
import followupPrompt from "../prompts/followupPrompt.js";

const followupLlm = createLlm(300, undefined, 0.2);

function parseJsonSafe(raw) {
    if (!raw) return null;
    let text = typeof raw === "string"
        ? raw
        : (Array.isArray(raw)
            ? raw.map((p) => (typeof p === "string" ? p : p?.text || "")).join("")
            : (raw?.text || String(raw)));
    if (!text || typeof text !== "string") return null;
    let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
    return JSON.parse(cleaned);
}

/**
 * Generates a probing follow-up question.
 * Strict SLA: Times out after 8 seconds and skips silently without blocking the interview.
 */
export async function generateFollowupQuestion(data, customLlm = null) {
    const activeLlm = customLlm || followupLlm;

    const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
            resolve({ timedOut: true });
        }, 8000);
    });

    const generationPromise = (async () => {
        try {
            const prompt = followupPrompt(data);
            const response = await activeLlm.invoke(prompt);
            const content = response?.content || response;
            const parsed = parseJsonSafe(content);

            if (parsed && typeof parsed.question === "string" && parsed.question.trim().length > 10) {
                let qText = parsed.question.trim();
                // Ensure under 25 words
                const words = qText.split(/\s+/);
                if (words.length > 25) {
                    qText = words.slice(0, 24).join(" ") + "?";
                }
                return { question: qText };
            }
            return null;
        } catch (err) {
            console.warn("[Followup Agent] Generation failed silently:", err.message);
            return null;
        }
    })();

    try {
        const raceResult = await Promise.race([generationPromise, timeoutPromise]);
        if (raceResult?.timedOut) {
            console.warn("[Followup Agent] Timed out after 8 seconds. Skipping follow-up silently.");
            return null;
        }
        return raceResult?.question || null;
    } catch (err) {
        console.warn("[Followup Agent] Unexpected error. Skipping follow-up silently:", err.message);
        return null;
    }
}
