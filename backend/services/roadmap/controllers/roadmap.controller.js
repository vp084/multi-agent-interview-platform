import Roadmap from "../models/roadmap.model.js";
import roadmapGraph from "../agents/roadmap.agent.js";
import redis from "../../../shared/redis/redis.js";

export const generateRoadmap = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID required",
            });
        }

        const {
            role,
            targetRole,
            duration = "3 Months",
            experience = "Fresher",
            package: tier = "Standard Tier",
            useResume = false,
            resume = {},
        } = req.body;

        const effectiveTargetRole = targetRole || role;
        if (!effectiveTargetRole) {
            return res.status(400).json({
                success: false,
                message: "Target role is required to generate a roadmap",
            });
        }

        console.log(`🚀 Generating roadmap for user ${userId} -> ${effectiveTargetRole}`);

        const result = await roadmapGraph.invoke({
            targetRole: effectiveTargetRole,
            role: effectiveTargetRole,
            duration,
            experience,
            package: tier,
            resume: useResume ? resume : {},
        });

        const roadmap = await Roadmap.create({
            userId,
            targetRole: result.targetRole || effectiveTargetRole,
            duration: result.duration || duration,
            experience,
            package: tier,
            modules: result.modules || [],
        });

        // Invalidate Redis list cache for user
        await redis.del(`user_roadmaps:${userId}`);

        return res.status(201).json({
            success: true,
            message: "Roadmap generated successfully",
            roadmap,
        });
    } catch (error) {
        console.error("Error in generateRoadmap:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate roadmap",
        });
    }
};

export const getAllRoadmaps = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID required",
            });
        }

        const cacheKey = `user_roadmaps:${userId}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                success: true,
                roadmaps: JSON.parse(cached),
                fromCache: true,
            });
        }

        const roadmaps = await Roadmap.find({ userId }).sort({ createdAt: -1 });

        await redis.set(cacheKey, JSON.stringify(roadmaps), "EX", 600);

        return res.status(200).json({
            success: true,
            roadmaps,
        });
    } catch (error) {
        console.error("Error in getAllRoadmaps:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch roadmaps",
        });
    }
};

export const getRoadmapById = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID required",
            });
        }

        const cacheKey = `roadmap:${id}`;
        const cached = await redis.get(cacheKey);
        if (cached) {
            return res.status(200).json({
                success: true,
                roadmap: JSON.parse(cached),
                fromCache: true,
            });
        }

        const roadmap = await Roadmap.findOne({ _id: id, userId });
        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: "Roadmap not found",
            });
        }

        await redis.set(cacheKey, JSON.stringify(roadmap), "EX", 600);

        return res.status(200).json({
            success: true,
            roadmap,
        });
    } catch (error) {
        console.error("Error in getRoadmapById:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch roadmap",
        });
    }
};

export const updateModuleStatus = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const { id, moduleId } = req.params;
        const { status } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID required",
            });
        }

        if (!["pending", "in_progress", "completed"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'pending', 'in_progress', or 'completed'",
            });
        }

        const roadmap = await Roadmap.findOneAndUpdate(
            { _id: id, userId, "modules._id": moduleId },
            { $set: { "modules.$.status": status } },
            { new: true }
        );

        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: "Roadmap or module not found",
            });
        }

        // Clear cache
        await redis.del(`roadmap:${id}`);
        await redis.del(`user_roadmaps:${userId}`);

        return res.status(200).json({
            success: true,
            message: "Module status updated",
            roadmap,
        });
    } catch (error) {
        console.error("Error in updateModuleStatus:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to update module status",
        });
    }
};

export const deleteRoadmap = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID required",
            });
        }

        const roadmap = await Roadmap.findOneAndDelete({ _id: id, userId });
        if (!roadmap) {
            return res.status(404).json({
                success: false,
                message: "Roadmap not found",
            });
        }

        // Clear cache
        await redis.del(`roadmap:${id}`);
        await redis.del(`user_roadmaps:${userId}`);

        return res.status(200).json({
            success: true,
            message: "Roadmap deleted successfully",
        });
    } catch (error) {
        console.error("Error in deleteRoadmap:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to delete roadmap",
        });
    }
};
