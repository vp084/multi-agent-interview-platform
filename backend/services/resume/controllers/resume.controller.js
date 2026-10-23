// pdf --> pdf storage --> text ---> llm -->agent --> prompt ---> data
// --> save in Mongodb --->redis-->pdf delete-->resume data(score,missing skills,recommendations)

import redis from "../../../shared/redis/redis.js";
import { resumeAgent } from "../agents/resume.agents.js";
import extractText from "../config/pdf.js";
import Resume from "../models/resume.model.js";
import fs from "fs"

const parseResumeJson = (text) => {
    const clean = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    try {
        return JSON.parse(clean);
    } catch {
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        throw new Error("Unable to parse structured resume data from AI");
    }
};

export const uploadResume = async (req, res) => {
    const file = req.file;
    try {
        if (!file) {
            return res.status(400).json({ success: false, message: "Please upload a resume" });
        }

        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(400).json({ success: false, message: "user id required" });
        }

        const resumeText = await extractText(file.path);
        const aiResponse = await resumeAgent(resumeText);
        const resumeData = parseResumeJson(aiResponse);

        let resume = await Resume.findOne({ userId });

        if (resume) {
            Object.assign(resume, { ...resumeData, extractedText: resumeText });
            await resume.save();
        } else {
            resume = await Resume.create({ userId, extractedText: resumeText, ...resumeData });
        }

        await redis.set(`resume:${userId}`, JSON.stringify(resume), "EX", 86400);

        return res.status(200).json({
            success: true,
            message: "Resume analyzed succesfully",
            data: resume
        });

    } catch (error) {
        console.error("Resume Upload Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        if (file?.path) {
            fs.promises.unlink(file.path).catch(() => {});
        }
    }
};

export const getResume = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID required"
            });
        }

        const cache = await redis.get(`resume:${userId}`);
        if (cache) {
            return res.status(200).json({
                success: true,
                message: "Resume fetched successfully",
                source: "redis",
                data: JSON.parse(cache)
            });
        }

        const resume = await Resume.findOne({ userId });
        if (!resume) {
            return res.status(200).json({
                success: true,
                message: "No resume found",
                data: null
            });
        }

        await redis.set(`resume:${userId}`, JSON.stringify(resume), "EX", 86400);

        return res.status(200).json({
            success: true,
            message: "Resume fetched successfully",
            source: "database",
            data: resume
        });

    } catch (error) {
        console.error("Get Resume Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
