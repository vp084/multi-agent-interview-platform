import mongoose from "mongoose";


const feedbackSchema = new mongoose.Schema(
    {
        score: {
            type: Number,
            default: null,
        },

        correctness: {
            type: Number,
            default: null,
        },

        clarity: {
            type: Number,
            default: null,
        },

        relevance: {
            type: Number,
            default: null,
        },

        detail: {
            type: Number,
            default: null,
        },

        efficiency: {
            type: Number,
            default: null,
        },

        communication: {
            type: Number,
            default: null,
        },

        problemSolving: {
            type: Number,
            default: null,
        },

        creativity: {
            type: Number,
            default: null,
        },

        feedback: {
            type: String,
            default: "",
        },

        reaction: {
            type: String,
            default: "",
        },

        improvements: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

const questionSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
        },
        userAnswer: {
            type: String,
            default: "",
        },

        transition: {
            type: String,
            default: "",
        },

        isFollowUp: {
            type: Boolean,
            default: false,
        },

        parentIndex: {
            type: Number,
            default: null,
        },

        phase: {
            type: String,
            enum: ["greeting", "warmup", "resume", "technical", "behavioral", "closing"],
        },

        type: {
            type: String,
            enum: ["technical", "hr", null],
        },

        topic: {
            type: String,
            default: "",
        },

        keyPoints: {
            type: [String],
            default: [],
        },

        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            default: "easy",
        },

        timer: {
            type: Number,
            default: 60,
        },

        feedback: {
            type: feedbackSchema,
            default: () => ({}),
        },
    },
    { _id: false }
);

const interviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: ["hr", "technical", "mixed"],
            required: true,
        },

        role: {
            type: String,
            required: true,
        },
        useResume: {
            type: Boolean,
            default: false,
        },

        length: {
            type: String,
            enum: ["quick", "standard", "full"],
            // No default — old docs without this field should read as undefined
        },

        totalQuestions: {
            type: Number,
            // No default — old docs should fall back to questions.length in code
        },

        currentQuestion: {
            type: Number,
            default: 0,
        },

        questions: {
            type: [questionSchema],
            default: [],
        },

        overallScore: {
            type: Number,
            default: 0,
        },

        phaseScores: {
            warmup: {
                type: Number,
                default: null,
            },
            resume: {
                type: Number,
                default: null,
            },
            technical: {
                type: Number,
                default: null,
            },
            behavioral: {
                type: Number,
                default: null,
            },
        },

        strengths: {
            type: [String],
            default: [],
        },

        weaknesses: {
            type: [String],
            default: [],
        },

        recommendations: {
            type: [String],
            default: [],
        },

        summary: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["in-progress", "completed"],
            default: "in-progress",
        },
    },
    {
        timestamps: true,
    }
);

const Interview = mongoose.model("Interview" , interviewSchema)

export default Interview