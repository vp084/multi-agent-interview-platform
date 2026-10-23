import express from "express";
import { uploadResume, getResume } from "../controllers/resume.controller.js";
import {
    analyzeGithubProject,
    generateProjectBullets,
    polishBullet,
} from "../controllers/githubProject.controller.js";
import { upload } from "../middleware/multer.js";

const resumeRouter = express.Router();

resumeRouter.post("/upload", upload.single("resume"), uploadResume);
resumeRouter.get("/", getResume);

// GitHub ATS Project Optimization Routes
resumeRouter.post("/project/analyze-github", analyzeGithubProject);
resumeRouter.post("/project/generate-bullets", generateProjectBullets);
resumeRouter.post("/project/polish-bullet", polishBullet);

export default resumeRouter;


