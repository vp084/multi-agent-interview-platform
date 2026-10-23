import { json } from "express";
import redis from "../../../shared/redis/redis.js";
import graph from "../graph/graph.js";
import Interview from "../models/interview.model.js";
import { calculateInterviewScores } from "../utils/scoring.js";
import { isAnswerEmptyOrSkipped } from "../agents/feedback.agent.js";
import { generateFollowupQuestion } from "../agents/followup.agent.js";

/**
 * FIX 3: Strips keyPoints from question objects before sending responses to the client.
 * KeyPoints are internal grading rubrics and MUST NEVER be exposed to the frontend.
 */
export function stripKeyPoints(data) {
    if (!data) return data;
    const obj = typeof data.toObject === "function" ? data.toObject() : JSON.parse(JSON.stringify(data));
    const cleanQ = (q) => {
        if (!q || typeof q !== "object") return;
        delete q.keyPoints;
    };
    if (Array.isArray(obj)) {
        obj.forEach(cleanQ);
    } else if (Array.isArray(obj.questions)) {
        obj.questions.forEach(cleanQ);
    } else if (obj.question && typeof obj.question === "object") {
        cleanQ(obj.question);
    } else {
        cleanQ(obj);
    }
    return obj;
}


export const startInterview = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const {
            type = "mixed",
            length = "standard",
            role,
            useResume = false,
            resume = {},
        } = req.body;

        if (!role || typeof role !== "string") {
            return res.status(400).json({
                success: false,
                message: "Target interview role is required",
            });
        }

        // Requirement 5: Basic input limits - strip newlines and control characters, max 80 characters
        const sanitizedRole = role.replace(/[\r\n\x00-\x1F\x7F]/g, "").trim();

        if (!sanitizedRole) {
            return res.status(400).json({
                success: false,
                message: "Target interview role cannot be empty",
            });
        }

        if (sanitizedRole.length > 80) {
            return res.status(400).json({
                success: false,
                message: "Target role must not exceed 80 characters",
            });
        }

        const normalizedType = ["hr", "technical", "mixed"].includes(String(type).toLowerCase())
            ? String(type).toLowerCase()
            : "mixed";

        // Step 1: Configurable interview length options (quick = 8, standard = 12, full = 16)
        const lengthMap = { quick: 8, standard: 12, full: 16 };
        const normalizedLength = lengthMap[String(length).toLowerCase()] ? String(length).toLowerCase() : "standard";
        const totalQuestionsCount = lengthMap[normalizedLength];

        // Requirement 4: Anti-repeat lookup matching role case-insensitively and trimmed, collecting from last 3 interviews
        const escapedRole = sanitizedRole.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const previousInterviews = await Interview.find({
            userId,
            role: { $regex: new RegExp(`^${escapedRole}$`, "i") }
        })
            .sort({ createdAt: -1 })
            .limit(3)
            .select("questions.question questions.topic");

        const pastQuestions = [];
        const pastTopicsSet = new Set();
        for (const prev of previousInterviews) {
            for (const q of prev.questions || []) {
                if (q?.question && q.question.trim()) {
                    pastQuestions.push(q.question.trim());
                }
                if (q?.topic && q.topic.trim()) {
                    pastTopicsSet.add(q.topic.trim());
                }
            }
        }
        const pastTopics = Array.from(pastTopicsSet);

        const result = await graph.invoke({
            action: "start",
            role: sanitizedRole,
            type: normalizedType,
            length: normalizedLength,
            totalQuestions: totalQuestionsCount,
            useResume,
            resume,
            pastQuestions,
            pastTopics,
        });

        const questions = result.questions;

        if (!questions || questions.length === 0) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate interview questions",
            });
        }

        const interview = await Interview.create({
            userId,
            type: normalizedType,
            length: normalizedLength,
            totalQuestions: questions.length || totalQuestionsCount,
            role: sanitizedRole,
            useResume,
            questions,
            currentQuestion: 0,
            status: "in-progress",
        });

        await redis.del(`interviews:${userId}`);

        return res.status(200).json({
            success: true,
            interviewId: interview._id,
            currentQuestion: 0,
            totalQuestions: interview.totalQuestions ?? interview.questions.length,
            length: interview.length,
            question: stripKeyPoints(interview.questions[0]),
        });
    } catch (error) {

        console.log(error)

        return res.status(500).json({

            success: false,

            message: error.message,

        });
    }
}


export const submitAnswer = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"]
        const { interviewId, answer = "" } = req.body

        if (!interviewId) {
            return res.status(400).json({
                success: false,
                message: "Interview Id is required",
            });
        }

        const interview = await Interview.findOne({
            _id: interviewId,
            userId
        })

        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found",
            });
        }

        if (interview.status === "completed") {
            return res.status(400).json({
                success: false,
                message: "Interview already completed",
            });
        }

        const index = interview.currentQuestion
        const currentQuestion = interview.questions[index]

        if (!currentQuestion) {
            return res.status(400).json({
                success: false,
                message: "Invalid question index",
            });
        }

        currentQuestion.userAnswer = typeof answer === "string" ? answer : "";

        const completed = interview.currentQuestion + 1 >=
            interview.questions.length;

        const result = await graph.invoke({
            action: "feedback",

            phase: currentQuestion.phase,

            question: currentQuestion.question,

            answer: currentQuestion.userAnswer,

            difficulty: currentQuestion.difficulty,

            keyPoints: currentQuestion.keyPoints || [],

            completed,

            role: interview.role,

            type: interview.type,

            questionType: currentQuestion.type,

            questions: interview.questions,
        });

        currentQuestion.feedback = result.feedback;

        // FIX 6: Follow-up question evaluation & insertion using inline followUp from evaluator
        const normPhase = String(currentQuestion.phase || "").toLowerCase();
        const isAllowedPhase = ["resume", "technical", "behavioral"].includes(normPhase);
        const answerWords = currentQuestion.userAnswer.trim().split(/\s+/).filter(Boolean);
        const score = currentQuestion.feedback?.score;
        const isLowScoreOrShort = (typeof score === "number" && score < 50) || (answerWords.length > 0 && answerWords.length < 15);
        const isSkippedOrEmpty = isAnswerEmptyOrSkipped(currentQuestion.userAnswer);
        const followupsCount = interview.questions.filter((q) => q.isFollowUp).length;
        const alreadyHasFollowUp = interview.questions[index + 1]?.isFollowUp && interview.questions[index + 1]?.parentIndex === index;

        if (isAllowedPhase && isLowScoreOrShort && !isSkippedOrEmpty && !currentQuestion.isFollowUp && !alreadyHasFollowUp && followupsCount < 4) {
            try {
                let followupText = result.feedback?.followUp?.question;
                let followupKeyPoints = result.feedback?.followUp?.keyPoints;

                // Fallback to separate call with 8s timeout protection only if evaluator didn't return followUp
                if (!followupText) {
                    const fuPromise = generateFollowupQuestion({
                        question: currentQuestion.question,
                        answer: currentQuestion.userAnswer,
                        topic: currentQuestion.topic,
                        phase: currentQuestion.phase,
                        role: interview.role,
                    });
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error("Follow-up generation timeout (8s)")), 8000)
                    );
                    followupText = await Promise.race([fuPromise, timeoutPromise]);
                }

                if (followupText) {
                    const followupQuestion = {
                        phase: currentQuestion.phase,
                        type: currentQuestion.type,
                        topic: currentQuestion.topic,
                        difficulty: currentQuestion.difficulty,
                        question: followupText,
                        keyPoints: Array.isArray(followupKeyPoints) && followupKeyPoints.length > 0
                            ? followupKeyPoints
                            : ["Core concept depth", "Practical trade-offs"],
                        transition: "Let's dig into that a bit further.",
                        timer: 90,
                        isFollowUp: true,
                        parentIndex: index,
                        userAnswer: "",
                        feedback: {},
                    };

                    interview.questions.splice(index + 1, 0, followupQuestion);
                }
            } catch (err) {
                console.warn("[Interview Controller] Follow-up skipped:", err.message);
            }
        }

        interview.currentQuestion++;

        const isInterviewCompleted = interview.currentQuestion >= interview.questions.length;

        if (isInterviewCompleted) {
            interview.status = "completed";

            // Overall score and per-phase averages computed strictly in code
            const { overallScore, phaseScores } = calculateInterviewScores(interview.questions);

            interview.overallScore = overallScore;
            interview.phaseScores = phaseScores;

            interview.summary = result.report?.summary || "";
            interview.strengths = result.report?.strengths || [];
            interview.weaknesses = result.report?.weaknesses || [];
            interview.recommendations = result.report?.recommendations || [];

            await interview.save();
            await redis.del(`interviews:${userId}`);

            return res.status(200).json({
                success: true,
                completed: true,
                interview: stripKeyPoints(interview),
                feedback: result.feedback,
            });
        }

        await interview.save();
        await redis.del(`interviews:${userId}`);

        return res.status(200).json({
            success: true,
            completed: false,
            currentQuestion: interview.currentQuestion,
            totalQuestions: interview.totalQuestions ?? interview.questions.length,
            questions: stripKeyPoints(interview.questions),
            question: stripKeyPoints(interview.questions[interview.currentQuestion]),
            feedback: result.feedback,
        });

    } catch (error) {

        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message,

        });

    }
}


export const getInterview = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"]
        const { id } = req.params

        const interview = await Interview.findOne({
            _id: id,
            userId
        })
        if (!interview) {
            return res.status(404).json({
                success: false,
                message: "Interview not found",
            });
        }

        return res.status(200).json({
            success: true,
            interview: stripKeyPoints(interview),
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({

            success: false,

            message: error.message,

        });
    }
}


export const getAllInterviews = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"]
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID required"
            });
        }

        const cache = await redis.get(`interviews:${userId}`)

        if (cache) {
            console.log("✅ Data served from Redis")
            return res.status(200).json(JSON.parse(cache))
        }

        const interviews = await Interview.find({ userId }).sort({ createdAt: -1 })

        const completed = interviews.filter((item) => item.status === "completed")

        const totalQuestions = interviews.reduce((sum, item) => sum + item.questions.length, 0)

        const averageScore = completed.length > 0 ? Number(
            (completed.reduce((sum, item) => sum + item.overallScore, 0)) / completed.length).toFixed(1) : 0


        const stats = {
            totalInterviews: interviews.length,
            totalQuestions,
            completed: completed.length,
            averageScore
        }

        const getAverageQuestionData = (questionsList) => {
            const total = {
                correctness: 0,
                clarity: 0,
                relevance: 0,
                detail: 0,
                efficiency: 0,
                communication: 0,
                problemSolving: 0,
                creativity: 0,
            };

            let count = 0;
            questionsList.forEach((q) => {
                if (q?.feedback) {
                    total.correctness += q.feedback.correctness || 0;
                    total.clarity += q.feedback.clarity || 0;
                    total.relevance += q.feedback.relevance || 0;
                    total.detail += q.feedback.detail || 0;
                    total.efficiency += q.feedback.efficiency || 0;
                    total.communication += q.feedback.communication || 0;
                    total.problemSolving += q.feedback.problemSolving || 0;
                    total.creativity += q.feedback.creativity || 0;
                    count++;
                }
            });

            if (count === 0) {
                return [
                    { skill: "Correctness", score: 0 },
                    { skill: "Clarity", score: 0 },
                    { skill: "Relevance", score: 0 },
                    { skill: "Detail", score: 0 },
                    { skill: "Efficiency", score: 0 },
                    { skill: "Communication", score: 0 },
                    { skill: "Problem solving", score: 0 },
                    { skill: "Creativity", score: 0 },
                ];
            }

            return [
                { skill: "Correctness", score: Math.round(total.correctness / count) },
                { skill: "Clarity", score: Math.round(total.clarity / count) },
                { skill: "Relevance", score: Math.round(total.relevance / count) },
                { skill: "Detail", score: Math.round(total.detail / count) },
                { skill: "Efficiency", score: Math.round(total.efficiency / count) },
                { skill: "Communication", score: Math.round(total.communication / count) },
                { skill: "Problem solving", score: Math.round(total.problemSolving / count) },
                { skill: "Creativity", score: Math.round(total.creativity / count) },
            ];
        };

        const technicalQuestions = [];
        const hrQuestions = [];
        let technicalSessionCount = 0;
        let hrSessionCount = 0;

        completed.forEach((item) => {
            let hasTech = false;
            let hasHr = false;
            (item.questions || []).forEach((q) => {
                // Exclude null-type questions (greeting / closing) from radar aggregation
                if (q.type === null || q.phase === "greeting" || q.phase === "closing") {
                    return;
                }
                const qType = q.type || (item.type === "hr" ? "hr" : "technical");
                if (qType === "hr") {
                    hrQuestions.push(q);
                    hasHr = true;
                } else if (qType === "technical") {
                    technicalQuestions.push(q);
                    hasTech = true;
                }
            });
            if (hasTech) technicalSessionCount++;
            if (hasHr) hrSessionCount++;
        });

        const technicalData = getAverageQuestionData(technicalQuestions);
        const hrData = getAverageQuestionData(hrQuestions);
        const technicalCount = technicalSessionCount;
        const hrCount = hrSessionCount;

        const sanitizedInterviews = interviews.map((item) => stripKeyPoints(item));

        const payload = {
            success: true,
            interviews: sanitizedInterviews,
            stats,
            technicalData,
            hrData,
            technicalCount,
            hrCount,
        };

            await redis.set(`interviews:${userId}`, JSON.stringify(payload), "EX", 600)


            return res.status(200).json(payload);

        


    } catch (error) {
        console.log(error)
        return res.status(500).json({

            success: false,

            message: error.message,

        });
    }
}


