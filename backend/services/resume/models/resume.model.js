import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            unique: true,
            index: true,
        },
        extractedText: {
            type: String,
            required: true,
        },
        score: {
            type: Number,
            default: 0,
        },
        summary: {
            type: String,
            default: "",
        },
        name: {
            type: String,
            default: "",
        },
        email: {
            type: String,
            default: "",
        },
        phone: {
            type: String,
            default: "",
        },
        education: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        skills: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        projects: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        experience: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        strengths: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        weaknesses: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        missingSkills: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
        suggestedRole: {
            type: String,
            default: "",
        },
        recommendations: {
            type: [mongoose.Schema.Types.Mixed],
            default: [],
        },
    },
    { timestamps: true }
);

const Resume = mongoose.model("Resume", ResumeSchema);

export default Resume;
