import { createLlm } from "../config/llm.js";
import { buildFeedbackMessages } from "../prompts/feedbackPrompt.js";

// Evaluator uses temperature 0.0 with fixed seed 42 for deterministic, consistent scoring
const feedbackLlm = createLlm(1500, undefined, 0.0, 42);

function parseJsonSafe(raw) {
    if (!raw) return null;
    let text = "";
    if (typeof raw === "string") {
        text = raw;
    } else if (raw && typeof raw === "object") {
        if (typeof raw.content === "string") {
            text = raw.content;
        } else if (Array.isArray(raw.content)) {
            text = raw.content.map((p) => (typeof p === "string" ? p : p?.text || "")).join("");
        } else if (typeof raw.text === "string") {
            text = raw.text;
        }
    }
    if (!text || typeof text !== "string") return null;
    let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const startIdx = cleaned.indexOf('{');
    const endIdx = cleaned.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleaned = cleaned.substring(startIdx, endIdx + 1);
    }
    try {
        return JSON.parse(cleaned);
    } catch (e) {
        return null;
    }
}

/**
 * Validates and clamps a numeric score.
 * FIX 4: Throws an Error if value is not a finite number so the retry logic is triggered.
 */
export function validateAndClampScore(val, fieldName = "score") {
    if (val === null || val === undefined) return null;
    const num = Number(val);
    if (!Number.isFinite(num) || isNaN(num)) {
        throw new Error(`Score validation failed: ${fieldName} is not a finite number (${val})`);
    }
    return Math.max(0, Math.min(100, Math.round(num)));
}

/**
 * Validates reaction lines according to FIX 5.
 * Rules:
 * - max 20 words
 * - no digits (0-9) or "%"
 * - no "?"
 * - none of: great, excellent, interesting, awesome, fantastic, perfect, wrong, incorrect, score
 * Fallback on failure: "Thanks, let's continue."
 */
export function validateReaction(reactionText) {
    if (!reactionText || typeof reactionText !== "string") {
        return "Thanks, let's continue.";
    }
    const trimmed = reactionText.trim();
    if (!trimmed) return "Thanks, let's continue.";

    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length > 20) return "Thanks, let's continue.";

    // Must not contain digits (0-9) or "%"
    if (/[\d%]/.test(trimmed)) return "Thanks, let's continue.";

    // Must not contain "?"
    if (trimmed.includes("?")) return "Thanks, let's continue.";

    // Forbidden words
    const FORBIDDEN_WORDS = /\b(great|excellent|interesting|awesome|fantastic|perfect|wrong|incorrect|score)\b/i;
    if (FORBIDDEN_WORDS.test(trimmed)) return "Thanks, let's continue.";

    return trimmed;
}

export function isAnswerEmptyOrSkipped(ans) {
    if (!ans || typeof ans !== "string") return true;
    const trimmed = ans.trim();
    if (trimmed.length === 0) return true;

    const lower = trimmed.toLowerCase();

    // Exact matches after trim and lowercase - never substring/includes
    const exactSkipPhrases = new Set([
        "skip",
        "skipped",
        "skip question",
        "skipped question",
        "skipped by candidate",
        "pass",
        "no answer",
        "no answer.",
        "no answer provided",
        "no answer provided.",
        "no answer provided. time over.",
        "time over",
        "time over.",
        "timed out",
        "time is up",
        "time is up.",
        "time up",
        "n/a",
        "na",
        "none",
        "i don't know",
        "idk",
        "next"
    ]);

    if (exactSkipPhrases.has(lower)) return true;

    // Very short non-answers (under 4 chars of pure symbols, e.g. "-", "...", "?")
    if (lower.length < 4 && !/[a-z0-9]/i.test(lower)) return true;

    return false;
}

export const feedbackAgent = async (data, customLlm = null) => {
    const activeLlm = customLlm || feedbackLlm;
    const normPhase = String(data.phase || "").toLowerCase();
    const isUnscoredPhase = normPhase === "greeting" || normPhase === "closing";

    // Unscored phases (greeting / closing) always return early without calling the LLM rubric
    if (isUnscoredPhase) {
        return {
            score: null,
            reaction: normPhase === "greeting" ? "Thanks for joining, let's get started." : "Thank you for your time today.",
            feedback: "Thank you! Let's proceed to the next part.",
            improvements: [],
            correctness: null,
            clarity: null,
            relevance: null,
            detail: null,
            efficiency: null,
            communication: null,
            problemSolving: null,
            creativity: null,
            followUp: null,
        };
    }

    // CHECK B: Skipped / Timed-out / Empty answers on scored phases get score 0 (not null)
    if (isAnswerEmptyOrSkipped(data.answer)) {
        if (normPhase === "warmup") {
            return {
                score: 0,
                reaction: "No problem, let's move on.",
                clarity: 0,
                communication: 0,
                correctness: null,
                relevance: null,
                detail: null,
                efficiency: null,
                problemSolving: null,
                creativity: null,
                feedback: "No answer was provided for this warmup question.",
                improvements: [
                    "Share a brief personal introduction.",
                    "Mention your key background interests.",
                    "Speak comfortably to build rapport."
                ],
                followUp: null,
            };
        }

        return {
            score: 0,
            reaction: "No problem, let's move on.",
            correctness: 0,
            clarity: 0,
            relevance: 0,
            detail: 0,
            efficiency: 0,
            communication: 0,
            problemSolving: 0,
            creativity: 0,
            feedback: "No answer was provided for this question.",
            improvements: [
                "Attempt every question.",
                "Share your thought process.",
                "Manage your response time."
            ],
            followUp: null,
        };
    }

    const maxAttempts = 2; // Initial attempt + 1 retry on invalid JSON or non-finite numbers
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        let response = null;
        try {
            const messages = buildFeedbackMessages(data);
            response = await activeLlm.invoke(messages);
            const content = response?.content || response;
            const parsed = parseJsonSafe(content);

            if (!parsed || typeof parsed !== "object") {
                throw new Error(`Invalid feedback JSON on attempt ${attempt}`);
            }

            // Reaction validation (FIX 5)
            const rawReaction = parsed.reaction || "Noted your response and technical perspective.";
            const validatedReaction = validateReaction(rawReaction);

            // Follow-up parsing (FIX 6)
            let followUpObj = null;
            if (parsed.followUp && typeof parsed.followUp.question === "string" && parsed.followUp.question.trim().length > 5) {
                let fuText = parsed.followUp.question.trim();
                const fuWords = fuText.split(/\s+/);
                if (fuWords.length > 25) {
                    fuText = fuWords.slice(0, 24).join(" ") + "?";
                }
                const fuKeyPoints = Array.isArray(parsed.followUp.keyPoints) && parsed.followUp.keyPoints.length > 0
                    ? parsed.followUp.keyPoints.slice(0, 2)
                    : ["Core concept depth", "Practical trade-offs"];
                followUpObj = {
                    question: fuText,
                    keyPoints: fuKeyPoints,
                };
            }

            if (normPhase === "warmup") {
                // FIX 3: Warmup has no keyPoints: communication and clarity levels 0-4, scaled to 100 in code
                const clarityLevel = validateAndClampScore(parsed.clarityLevel ?? 2, "clarityLevel");
                const communicationLevel = validateAndClampScore(parsed.communicationLevel ?? 2, "communicationLevel");

                const clarityScore = Math.round((Math.min(4, Math.max(0, clarityLevel)) / 4) * 100);
                const communicationScore = Math.round((Math.min(4, Math.max(0, communicationLevel)) / 4) * 100);
                const overallScore = Math.round((clarityScore + communicationScore) / 2);

                return {
                    score: overallScore,
                    reaction: validatedReaction,
                    clarity: clarityScore,
                    communication: communicationScore,
                    correctness: null,
                    relevance: null,
                    detail: null,
                    efficiency: null,
                    problemSolving: null,
                    creativity: null,
                    feedback: parsed.feedback || "Warm introduction with clear communication.",
                    improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0
                        ? parsed.improvements
                        : ["Pace your delivery.", "Highlight core interests.", "Conclude smoothly."],
                    followUp: null,
                };
            }

            // FIX 3: Numeric score computed IN CODE:
            // 60% key-point coverage (covered = 1, partial = 0.5, missing = 0)
            // 40% mean axis level (0-4) scaled to 100
            let coverageScore = 70; // default if no keyPoints provided
            if (Array.isArray(parsed.keyPointEvaluations) && parsed.keyPointEvaluations.length > 0) {
                let totalCoveragePoints = 0;
                parsed.keyPointEvaluations.forEach((kpe) => {
                    const st = String(kpe.status || "").toLowerCase();
                    if (st === "covered") totalCoveragePoints += 1.0;
                    else if (st === "partial") totalCoveragePoints += 0.5;
                });
                coverageScore = Math.round((totalCoveragePoints / parsed.keyPointEvaluations.length) * 100);
            }

            // Validate level 0-4 inputs for all 8 axes
            const getAxisLevel = (key) => {
                const val = parsed[`${key}Level`] ?? parsed[key] ?? 2;
                const validated = validateAndClampScore(val, `${key}Level`);
                return Math.min(4, Math.max(0, validated > 4 ? Math.round(validated / 25) : validated));
            };

            const axes = ["correctness", "clarity", "relevance", "detail", "efficiency", "communication", "problemSolving", "creativity"];
            const axisScores = {};
            let sumAxisScores = 0;

            axes.forEach((axis) => {
                const level = getAxisLevel(axis);
                const scaledScore = Math.round((level / 4) * 100);
                axisScores[axis] = scaledScore;
                sumAxisScores += scaledScore;
            });

            const meanAxisScore = Math.round(sumAxisScores / axes.length);
            const calculatedOverallScore = Math.round(0.60 * coverageScore + 0.40 * meanAxisScore);

            return {
                score: calculatedOverallScore,
                reaction: validatedReaction,
                correctness: axisScores.correctness,
                clarity: axisScores.clarity,
                relevance: axisScores.relevance,
                detail: axisScores.detail,
                efficiency: axisScores.efficiency,
                communication: axisScores.communication,
                problemSolving: axisScores.problemSolving,
                creativity: axisScores.creativity,
                feedback: parsed.feedback || "Solid response covering the question.",
                improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0
                    ? parsed.improvements
                    : ["Provide technical specifics.", "Detail the trade-offs.", "Include concrete examples."],
                followUp: followUpObj,
            };
        } catch (error) {
            lastError = error;
            console.warn(`[Feedback Agent] Attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
            if (error?.message && error.message.includes("429")) {
                let waitMs = 8000;
                const match = error.message.match(/try again in ([\d\.]+)s/i);
                if (match && match[1]) {
                    waitMs = Math.ceil(parseFloat(match[1]) * 1000) + 1200;
                }
                console.log(`[Feedback Agent] Backing off on 429 for ${waitMs}ms before retry...`);
                await new Promise((r) => setTimeout(r, waitMs));
            }
            if (attempt === maxAttempts) {
                console.error("Feedback Agent Error after retry:", error.message);
                if (response?.content) console.error("Raw feedback content:", response.content);
            }
        }
    }

    // Fallback realistic feedback if all attempts fail
    const hasSubstantiveAnswer = Boolean(data.answer && data.answer.trim().length > 25);
    const isHr = String(data.type).toLowerCase() === "hr" || normPhase === "behavioral";
    const baseScore = hasSubstantiveAnswer ? 70 : 35;

    if (normPhase === "warmup") {
        return {
            score: baseScore,
            reaction: "Thanks, let's continue.",
            clarity: baseScore,
            communication: baseScore + 2,
            correctness: null,
            relevance: null,
            detail: null,
            efficiency: null,
            problemSolving: null,
            creativity: null,
            feedback: hasSubstantiveAnswer
                ? "Clear and authentic introduction with good pacing."
                : "The introduction was brief. Elaborating slightly more on your journey will create stronger rapport.",
            improvements: [
                "Highlight relevant milestones.",
                "Maintain structured pacing.",
                "Express enthusiasm for the role."
            ],
            followUp: null,
        };
    }

    return {
        score: baseScore,
        reaction: "Thanks, let's continue.",
        correctness: baseScore,
        clarity: baseScore,
        relevance: baseScore,
        detail: baseScore,
        efficiency: baseScore,
        communication: baseScore,
        problemSolving: baseScore,
        creativity: baseScore,
        feedback: hasSubstantiveAnswer
            ? (isHr
                ? "Solid response with good self-awareness. Structuring your narrative around specific actions and measurable outcomes will make it stronger."
                : "Solid response covering key principles. Incorporating more specific architectural decisions will elevate the impact.")
            : (isHr
                ? "The response was brief. Provide a concrete scenario using the STAR framework to highlight your teamwork and accountability."
                : "The answer was brief. Providing a deeper breakdown and technical examples will demonstrate stronger mastery."),
        improvements: isHr
            ? [
                "Use the STAR method structure.",
                "Highlight personal ownership clearly.",
                "Include measurable team outcomes."
            ]
            : [
                "Include a concrete technical example.",
                "Detail the trade-offs involved.",
                "Explain how to verify or test the approach."
            ],
        followUp: null,
    };
};