import express from "express";
import {
    getPlans,
    getKey,
    createOrder,
    verifyPayment,
    getPaymentHistory,
} from "../controllers/billing.controller.js";

const router = express.Router();

router.get("/plans", getPlans);
router.get("/key", getKey);
router.post("/order", createOrder);
router.post("/verify", verifyPayment);
router.get("/history", getPaymentHistory);

export default router;
