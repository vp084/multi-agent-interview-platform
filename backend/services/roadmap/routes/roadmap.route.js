import express from "express";
import {
    generateRoadmap,
    getAllRoadmaps,
    getRoadmapById,
    updateModuleStatus,
    deleteRoadmap,
} from "../controllers/roadmap.controller.js";

const router = express.Router();

router.post("/generate", generateRoadmap);
router.get("/all", getAllRoadmaps);
router.get("/:id", getRoadmapById);
router.patch("/:id/module/:moduleId", updateModuleStatus);
router.delete("/:id", deleteRoadmap);

export default router;
