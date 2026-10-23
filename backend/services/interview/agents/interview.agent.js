import { z } from "zod";
import llm, { createLlm } from "../config/llm.js";
import { buildInterviewPrompt, buildInterviewMessages, getPhaseConfig } from "../prompts/mixedInterviewPrompt.js";

// Zod schema for individual question
const QuestionSchema = z.object({
  phase: z.enum(["greeting", "warmup", "resume", "technical", "behavioral", "closing"], {
    errorMap: () => ({ message: "phase must be one of: greeting, warmup, resume, technical, behavioral, closing" }),
  }),
  transition: z.string().optional().default(""),
  type: z.enum(["technical", "hr"]).nullable().optional(),
  question: z
    .string()
    .min(15, { message: "Question text must be at least 15 characters long" }),
  topic: z
    .string()
    .min(2, { message: "Topic must be provided for each question" }),
  keyPoints: z.array(z.string()).default([]),
  difficulty: z.enum(["easy", "medium", "hard"]).catch("medium"),
  timer: z.number().int().min(30).max(900).catch(90),
});

// Zod schema for questions payload
const QuestionsResponseSchema = z.object({
  questions: z.array(QuestionSchema),
});

/**
 * Extracts and cleans JSON from raw LLM text
 */
function parseJsonSafe(text) {
  if (!text) return null;
  let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");
  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  } else {
    // Check if array was returned at root
    const arrStart = cleaned.indexOf("[");
    const arrEnd = cleaned.lastIndexOf("]");
    if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
      cleaned = `{"questions": ${cleaned.substring(arrStart, arrEnd + 1)}}`;
    }
  }
  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    try {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0].replace(/,\s*([\]}])/g, "$1"));
      }
    } catch {}
    return null;
  }
}


/**
 * Validates and enforces interview questions constraints and phase structure
 */
export function validateAndEnforceQuestions(
  rawPayload,
  requestedType = "mixed",
  expectedTotal = 12,
  useResume = false,
  resume = {}
) {
  const parsed = QuestionsResponseSchema.parse(rawPayload);
  const questions = parsed.questions;
  const normType = (requestedType || "mixed").toLowerCase();

  // 1. Total questions count verification
  if (questions.length !== expectedTotal) {
    throw new Error(
      `Interview must contain exactly ${expectedTotal} questions. Received ${questions.length}.`
    );
  }

  // 2. Phase count verification based on length and interview type
  const config = getPhaseConfig({
    totalQuestions: expectedTotal,
    type: normType,
    useResume,
  });

  const phaseCounts = {
    greeting: 0,
    warmup: 0,
    resume: 0,
    technical: 0,
    behavioral: 0,
    closing: 0,
  };

  for (const q of questions) {
    if (phaseCounts[q.phase] !== undefined) {
      phaseCounts[q.phase]++;
    } else {
      throw new Error(`Invalid question phase: "${q.phase}". Must be one of greeting, warmup, resume, technical, behavioral, closing.`);
    }
  }

  for (const phase of ["greeting", "warmup", "resume", "technical", "behavioral", "closing"]) {
    if (phaseCounts[phase] !== config[phase]) {
      throw new Error(
        `Phase count mismatch for "${phase}". Expected exactly ${config[phase]}, but received ${phaseCounts[phase]}. (Interview: ${normType}, total: ${expectedTotal})`
      );
    }
  }

  // 3. Phase order enforcement (greeting first, closing last, warmup right after greeting)
  if (questions[0].phase !== "greeting") {
    throw new Error(
      `Phase order violation: First question (Q1) must be in "greeting" phase, but received "${questions[0].phase}".`
    );
  }

  if (questions[questions.length - 1].phase !== "closing") {
    throw new Error(
      `Phase order violation: Final question (Q${expectedTotal}) must be in "closing" phase, but received "${questions[questions.length - 1].phase}".`
    );
  }

  for (let i = 1; i <= config.warmup; i++) {
    if (questions[i].phase !== "warmup") {
      throw new Error(
        `Phase order violation: Question Q${i + 1} must be in "warmup" phase immediately following greeting, but received "${questions[i].phase}".`
      );
    }
  }

  // CHECK C: Greeting introduces interviewer, role, duration and asks if ready; does NOT ask for self-introduction
  if (/(introduce yourself|tell (me|us) about yourself|your background)/i.test(questions[0].question)) {
    throw new Error(
      `Greeting question must introduce the interviewer, role, and duration, and ask if candidate is ready. It must NOT ask the candidate to introduce themselves — "Tell me about yourself" belongs in Warmup Q1.`
    );
  }

  // CHECK C: Warmup Q1 MUST ask candidate to introduce themselves ("Tell me about yourself" / background / interest)
  const warmupQ1 = questions[1]?.question || "";
  if (!/(yourself|background|journey|story|introduce|walk me through|sparked|curiosity|interest|started|career path|passion)/i.test(warmupQ1)) {
    throw new Error(
      `Warmup question 1 must ask the candidate to introduce themselves ("Tell me about yourself" / background). Received: "${warmupQ1}".`
    );
  }

  // 4. Warmup heuristic: Must be rapport/personal questions, NOT technical quizzes
  const TECHNICAL_QUIZ_PATTERNS = [
    /\bhow does (the )?[a-z0-9_]+ (handle|work|scale|manage|reconcile|allocate)\b/i,
    /\bexplain (the )?(difference|internal|architecture|trade-offs?|mechanism|lifecycle|event loop|garbage collection|protocol|algorithm|concurrency)\b/i,
    /\bwhat (is|are) the (difference|operational differences|trade-offs?|time complexity|space complexity)\b/i,
    /\bimplement (a|an|the)?\b/i,
    /\bwrite (a|an|the|code|function|query)\b/i,
    /\bhow would you design (a|an)?\b/i,
    /\bcalculate (the)?\b/i,
  ];

  for (const q of questions) {
    if (q.phase === "warmup") {
      for (const pattern of TECHNICAL_QUIZ_PATTERNS) {
        if (pattern.test(q.question)) {
          throw new Error(
            `Warmup question "${q.question}" looks like a technical quiz question. Warmup questions must be personal/rapport questions (e.g. background, motivation, technologies they are most comfortable with).`
          );
        }
      }
    }
  }

  // 5. Resume phase specificity: ensure resume questions reference resume keywords/projects
  if (useResume && resume && config.resume > 0) {
    const resumeKeywords = [];
    if (Array.isArray(resume.projects)) {
      resume.projects.forEach((p) => {
        const text = typeof p === "string" ? p : p.name || p.title || "";
        text.split(/[^a-zA-Z0-9]+/).filter((w) => w.length > 3).forEach((w) => resumeKeywords.push(w.toLowerCase()));
      });
    } else if (typeof resume.projects === "string") {
      resume.projects.split(/[^a-zA-Z0-9]+/).filter((w) => w.length > 3).forEach((w) => resumeKeywords.push(w.toLowerCase()));
    }

    if (Array.isArray(resume.skills)) {
      resume.skills.forEach((s) => {
        if (typeof s === "string" && s.length > 2) resumeKeywords.push(s.toLowerCase());
      });
    } else if (typeof resume.skills === "string") {
      resume.skills.split(/[^a-zA-Z0-9]+/).filter((w) => w.length > 2).forEach((w) => resumeKeywords.push(w.toLowerCase()));
    }

    const uniqueResumeKeywords = [...new Set(resumeKeywords)];
    if (uniqueResumeKeywords.length > 0) {
      for (const q of questions) {
        if (q.phase === "resume") {
          const qLower = q.question.toLowerCase();
          const matches = uniqueResumeKeywords.some((kw) => qLower.includes(kw));
          if (!matches) {
            throw new Error(
              `Resume phase question "${q.question}" does not reference any specific project or skill from the candidate's resume.`
            );
          }
        }
      }
    }
  }

  // 6. Duplicate and near-duplicate check
  const normalizedTexts = questions.map((q) => q.question.trim().toLowerCase());
  const uniqueSet = new Set(normalizedTexts);
  if (uniqueSet.size !== questions.length) {
    throw new Error("Duplicate questions detected in the generated interview.");
  }

  for (let i = 0; i < normalizedTexts.length; i++) {
    const wordsA = new Set(
      normalizedTexts[i].replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 3)
    );
    for (let j = i + 1; j < normalizedTexts.length; j++) {
      const wordsB = new Set(
        normalizedTexts[j].replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 3)
      );
      if (wordsA.size > 0 && wordsB.size > 0) {
        const intersection = [...wordsA].filter((w) => wordsB.has(w));
        const similarity = (2 * intersection.length) / (wordsA.size + wordsB.size);
        if (similarity > 0.85) {
          throw new Error(
            `Near-duplicate questions detected: "${questions[i].question}" and "${questions[j].question}".`
          );
        }
      }
    }
  }

  // 7. Enforce question.type per phase rules:
  // - greeting, warmup, and closing: type is null (warmup is scored later on communication/clarity, but stays out of tech/hr radars)
  // - behavioral: type is "hr"
  // - technical: type is "technical"
  // - resume: type is "technical" (or "hr" for HR-only round)
  // 8. STEP 5B: Neutral transition enforcement (max 15 words, no praise words, no questions)
  const BANNED_PRAISE = /\b(great|interesting|excellent|awesome|good|impressive|fantastic|wonderful|superb|well done)\b/i;

  return questions.map((q, idx) => {
    let effectiveType = null;
    if (q.phase === "greeting" || q.phase === "warmup" || q.phase === "closing") {
      effectiveType = null;
    } else if (q.phase === "behavioral") {
      effectiveType = "hr";
    } else if (q.phase === "technical") {
      effectiveType = "technical";
    } else if (q.phase === "resume") {
      effectiveType = normType === "hr" ? "hr" : "technical";
    }

    let transition = (q.transition || "").trim();
    if (idx === 0) {
      transition = "";
    } else {
      const words = transition.split(/\s+/).filter(Boolean);
      const hasPraise = BANNED_PRAISE.test(transition);
      const hasQuestion = transition.includes("?");
      const tooLong = words.length > 15;

      if (hasPraise || hasQuestion || tooLong || !transition) {
        if (q.phase === "warmup") {
          transition = "Moving on to a brief warmup before we dive deeper.";
        } else if (q.phase === "resume") {
          transition = "Turning our attention to the projects and experience from your resume.";
        } else if (q.phase === "technical") {
          transition = "Shifting gears to our technical architecture questions.";
        } else if (q.phase === "behavioral") {
          transition = "Switching focus to how you collaborate and manage team challenges.";
        } else if (q.phase === "closing") {
          transition = "Moving on to our wrap-up and questions you have for us.";
        } else {
          transition = "Let's move on to our next question.";
        }
      }
    }

    let keyPoints = Array.isArray(q.keyPoints) ? q.keyPoints.filter(Boolean) : [];
    if (q.phase === "greeting" || q.phase === "warmup" || q.phase === "closing") {
      keyPoints = [];
    } else if (keyPoints.length === 0) {
      if (q.phase === "behavioral") {
        keyPoints = ["Specific Situation and Task", "Concrete Actions taken and personal ownership", "Measurable Results and lessons learned"];
      } else {
        keyPoints = [`Core principles of ${q.topic || "the system"}`, "Implementation specifics and trade-offs", "Edge cases, scaling or failure handling"];
      }
    }

    return {
      ...q,
      type: effectiveType,
      transition,
      keyPoints,
    };
  });
}

/**
 * Main Interview Agent with retry mechanism and schema validation
 */
export const interviewAgent = async (data, customLlm = null) => {
  const activeLlm = customLlm || createLlm(8192, undefined, 0.2);

  const requestedType = (data.type || "mixed").toLowerCase();
  const lengthMap = { quick: 8, standard: 12, full: 16 };
  const targetTotal =
    Number(data.totalQuestions) ||
    lengthMap[String(data.length).toLowerCase()] ||
    12;
  const useResume = Boolean(data.useResume);
  const maxAttempts = 3; // Initial attempt + up to 2 retries
  let attempt = 0;
  let lastError = null;
  let retryFeedback = "";

  while (attempt < maxAttempts) {
    attempt++;
    let responseText = "";
    try {
      const messages = buildInterviewMessages({
        role: data.role,
        type: requestedType,
        totalQuestions: targetTotal,
        useResume,
        resume: data.resume,
        pastQuestions: data.pastQuestions || [],
        pastTopics: data.pastTopics || [],
        retryFeedback,
      });

      const response = await activeLlm.invoke(messages);
      responseText = typeof response === "string" ? response : response?.content || "";

      const rawJson = parseJsonSafe(responseText);
      if (!rawJson) {
        console.warn("[Interview Agent] Failed to parse JSON. Raw preview:", responseText.slice(0, 300));
        throw new Error("Failed to parse LLM output as JSON");
      }

      const validatedQuestions = validateAndEnforceQuestions(
        rawJson,
        requestedType,
        targetTotal,
        useResume,
        data.resume
      );

      return validatedQuestions;
    } catch (err) {
      lastError = err;
      console.warn(
        `[Interview Agent] Attempt ${attempt}/${maxAttempts} failed: ${err.message}`
      );
      retryFeedback = err.message;
    }
  }

  throw new Error(
    `Failed to generate valid interview questions after ${maxAttempts} attempts. Error: ${lastError?.message}`
  );
};