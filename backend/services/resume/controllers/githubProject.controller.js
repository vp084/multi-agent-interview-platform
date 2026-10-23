import { fetchRepositoryContext } from "../config/github.js";
import {
    analyzeProjectForATS,
    generateGroundedProjectBullets,
    polishIndividualBullet,
} from "../agents/githubProject.agent.js";

/**
 * Controller: Analyzes a GitHub repository and returns verified tech stack,
 * ATS keyword alignment, quantified score, and 2 mini-interview questions.
 */
export const analyzeGithubProject = async (req, res) => {
    try {
        const { repoUrl, targetRole, targetJD } = req.body;

        if (!repoUrl) {
            return res.status(400).json({
                success: false,
                message: "GitHub repository URL is required.",
            });
        }

        // 1. Fetch live repository context
        const repoData = await fetchRepositoryContext(repoUrl);

        // 2. Run ATS Analysis Agent
        const analysis = await analyzeProjectForATS({
            repoData,
            targetRole: targetRole || "Software Engineer",
            targetJD: targetJD || "",
        });

        return res.status(200).json({
            success: true,
            data: {
                repoInfo: {
                    name: repoData.name,
                    fullName: repoData.fullName,
                    description: repoData.description,
                    stars: repoData.stars,
                    language: repoData.language,
                    htmlUrl: repoData.htmlUrl,
                    breadcrumbs: repoData.architectureBreadcrumbs,
                    domainModels: repoData.domainModels,
                    recentCommits: repoData.recentCommits,
                },
                repoDataSummary: {
                    dependencies: repoData.dependencies,
                    architectureBreadcrumbs: repoData.architectureBreadcrumbs,
                    domainModels: repoData.domainModels,
                    recentCommits: repoData.recentCommits,
                    readmeSummary: repoData.readmeSummary,
                },
                ...analysis,
            },
        });
    } catch (error) {
        console.error("Analyze GitHub Project Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to analyze GitHub repository.",
        });
    }
};

/**
 * Controller: Combines repo facts + student mini-interview answers
 * to generate grounded Google X-Y-Z resume bullet points with ATS keywords.
 */
export const generateProjectBullets = async (req, res) => {
    try {
        const {
            repoData,
            targetRole,
            targetJD,
            detectedTech,
            interviewAnswers,
            bulletStyle = "xyz",
        } = req.body;

        if (!repoData || !repoData.name) {
            return res.status(400).json({
                success: false,
                message: "Repository data is required.",
            });
        }

        const generated = await generateGroundedProjectBullets({
            repoData,
            targetRole: targetRole || "Software Engineer",
            targetJD: targetJD || "",
            detectedTech: detectedTech || [],
            interviewAnswers: interviewAnswers || {},
            bulletStyle,
        });

        return res.status(200).json({
            success: true,
            data: generated,
        });
    } catch (error) {
        console.error("Generate Project Bullets Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate project bullets.",
        });
    }
};

/**
 * Controller: Polish an individual bullet on demand
 */
export const polishBullet = async (req, res) => {
    try {
        const { originalBullet, instruction, techStack, targetRole } = req.body;

        if (!originalBullet) {
            return res.status(400).json({
                success: false,
                message: "originalBullet is required.",
            });
        }

        const result = await polishIndividualBullet({
            originalBullet,
            instruction,
            techStack,
            targetRole,
        });

        return res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error("Polish Bullet Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to polish bullet point.",
        });
    }
};
