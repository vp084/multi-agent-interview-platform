import { feedbackAgent } from "../agents/feedback.agent.js";
import { interviewAgent } from "../agents/interview.agent.js";
import { summaryAgent } from "../agents/summary.agent.js";
import { calculateInterviewScores } from "../utils/scoring.js";

export async function interviewNode(state) {
    const questions = await interviewAgent({
        role: state.role,
        type: state.type,
        length: state.length || "standard",
        totalQuestions: state.totalQuestions,
        useResume: state.useResume,
        resume: state.resume,
        pastQuestions: state.pastQuestions || [],
        pastTopics: state.pastTopics || [],
    });

    return {
        questions
    };
}

export async function feedbackNode(state) {
    const feedback = await feedbackAgent({
        question: state.question,
        answer: state.answer,
        difficulty: state.difficulty,
        phase: state.phase,
        type: state.questionType || state.type,
        keyPoints: state.keyPoints || [],
    });

    let updatedQuestions = state.questions;
    if (Array.isArray(state.questions) && state.completed) {
        updatedQuestions = state.questions.map((q, idx) => {
            if (idx === state.questions.length - 1) {
                return {
                    ...(typeof q.toObject === "function" ? q.toObject() : q),
                    userAnswer: state.answer,
                    feedback,
                };
            }
            return typeof q.toObject === "function" ? q.toObject() : q;
        });
    }

    return {
        feedback,
        questions: updatedQuestions,
    };
}

export async function summaryNode(state) {
    const scores = calculateInterviewScores(state.questions);
    const overallScore = typeof state.overallScore === "number" ? state.overallScore : scores.overallScore;
    const phaseScores = state.phaseScores || scores.phaseScores;

    const report = await summaryAgent({
        role: state.role,
        type: state.type,
        questions: state.questions,
        overallScore,
        phaseScores,
    });

    return {
        report: {
            ...report,
            overallScore,
            phaseScores,
        }
    };
}