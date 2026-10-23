import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    duration: {
        type: String,
        default: "1-2 Weeks",
    },
    difficulty: {
        type: String,
        enum: ["Beginner", "Intermediate", "Advanced"],
        default: "Intermediate",
    },
    topics: {
        type: [String],
        default: [],
    },
    resources: {
        youtube: [
            {
                title: { type: String, default: "" },
                url: { type: String, default: "" },
            },
        ],
        articles: [
            {
                title: { type: String, default: "" },
                url: { type: String, default: "" },
            },
        ],
        notes: {
            type: String,
            default: "",
        },
    },
    status: {
        type: String,
        enum: ["pending", "in_progress", "completed"],
        default: "pending",
    },
});

const roadmapSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        targetRole: {
            type: String,
            required: true,
        },
        duration: {
            type: String,
            default: "3 Months",
        },
        experience: {
            type: String,
            default: "Fresher",
        },
        package: {
            type: String,
            default: "Standard Tier",
        },
        modules: [moduleSchema],
    },
    { timestamps: true }
);

const Roadmap = mongoose.models.Roadmap || mongoose.model("Roadmap", roadmapSchema);

export default Roadmap;
