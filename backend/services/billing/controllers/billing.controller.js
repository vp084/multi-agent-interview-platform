import crypto from "crypto";
import axios from "axios";
import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import { getRazorpayInstance } from "../config/razorpay.js";

export const PLANS = [
    {
        id: "starter",
        name: "Starter Pack",
        price: 99,
        coins: 100,
        description: "Perfect for quick practice sessions & resume verification.",
        badge: "Essential",
        popular: false,
        features: [
            "100 Interview Coins credited instantly",
            "2 Complete Mock Interviews (50 coins each)",
            "3 Comprehensive ATS Resume Scans",
            "Targeted AI Performance Feedback",
            "Validity: Lifetime access",
        ],
    },
    {
        id: "pro",
        name: "Professional Pack",
        price: 399,
        coins: 500,
        description: "Most popular choice for active job seekers & career transitions.",
        badge: "Most Popular",
        popular: true,
        features: [
            "500 Interview Coins credited instantly",
            "10 Full-length AI Mock Interviews",
            "Unlimited ATS Resume Optimizations",
            "Autonomous Career Roadmap Generation",
            "Behavioral & Technical Deep-Dive Feedback",
            "Audio & Video Analysis Insights",
        ],
    },
    {
        id: "enterprise",
        name: "Executive Pack",
        price: 999,
        coins: 1500,
        description: "Maximum coins for comprehensive prep across multiple domains.",
        badge: "Best Value",
        popular: false,
        features: [
            "1500 Interview Coins (Save 35%)",
            "30 Full-length Mock Interviews",
            "Multi-Role Career Roadmaps",
            "Unlimited GitHub & Resume ATS Audits",
            "Priority AI Evaluation Queue",
            "Lifetime Interview Archive & Trends",
        ],
    },
];

// Fallback helper to update user coins directly in MongoDB if auth service is busy
const updateUserCoinsDirect = async (userId, coins) => {
    try {
        const userConn = mongoose.createConnection(
            process.env.USER_MONGODB_URL || process.env.MONGODB_URL.replace("/billing", "/user")
        );
        const UserSchema = new mongoose.Schema(
            { interviewCoin: { type: Number, default: 150 } },
            { strict: false }
        );
        const UserModel = userConn.model("User", UserSchema, "users");
        const updated = await UserModel.findByIdAndUpdate(
            userId,
            { $inc: { interviewCoin: coins } },
            { new: true }
        );
        setTimeout(() => userConn.close(), 1000);
        return updated?.interviewCoin;
    } catch (err) {
        console.error("Direct user coin update error:", err.message);
        return null;
    }
};

export const getPlans = (req, res) => {
    return res.status(200).json({
        success: true,
        plans: PLANS,
    });
};

export const getKey = (req, res) => {
    const key = process.env.RAZORPAY_KEY_ID?.trim()?.replace(/^["']|["']$/g, "");
    const isConfigured = Boolean(key && key !== "rzp_test_placeholder");
    return res.status(200).json({
        success: true,
        key: isConfigured ? key : null,
        isConfigured,
    });
};

export const createOrder = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User session required",
            });
        }

        const { planId } = req.body;
        const plan = PLANS.find((p) => p.id === planId);
        if (!plan) {
            return res.status(400).json({
                success: false,
                message: "Invalid plan selected",
            });
        }

        const razorpay = getRazorpayInstance();

        // If Razorpay API key is not configured, support simulated development order
        if (!razorpay) {
            const simulatedOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            
            await Payment.create({
                userId,
                orderId: simulatedOrderId,
                planId: plan.id,
                planName: plan.name,
                amount: plan.price,
                currency: "INR",
                coins: plan.coins,
                status: "created",
            });

            return res.status(200).json({
                success: true,
                isSimulated: true,
                order: {
                    id: simulatedOrderId,
                    amount: plan.price * 100,
                    currency: "INR",
                },
                plan,
                message: "Simulated order created (Razorpay keys not yet provided)",
            });
        }

        // Real Razorpay order creation
        const options = {
            amount: plan.price * 100, // amount in paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}_${userId.slice(-6)}`,
            notes: {
                userId,
                planId: plan.id,
                coins: plan.coins,
            },
        };

        const razorpayOrder = await razorpay.orders.create(options);

        await Payment.create({
            userId,
            orderId: razorpayOrder.id,
            planId: plan.id,
            planName: plan.name,
            amount: plan.price,
            currency: "INR",
            coins: plan.coins,
            status: "created",
        });

        return res.status(200).json({
            success: true,
            isSimulated: false,
            order: razorpayOrder,
            plan,
            key: process.env.RAZORPAY_KEY_ID?.trim()?.replace(/^["']|["']$/g, ""),
        });
    } catch (error) {
        console.error("Create order error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create payment order",
        });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User session required",
            });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            isSimulated,
        } = req.body;

        if (!razorpay_order_id) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required for verification",
            });
        }

        const payment = await Payment.findOne({ orderId: razorpay_order_id });
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Order record not found",
            });
        }

        if (payment.status === "completed") {
            return res.status(200).json({
                success: true,
                message: "Payment was already completed",
                payment,
            });
        }

        // Handle simulated checkout flow in development
        if (isSimulated || razorpay_order_id.startsWith("order_sim_")) {
            payment.paymentId = `pay_sim_${Date.now()}`;
            payment.signature = "simulated_valid_signature";
            payment.status = "completed";
            await payment.save();

            let newBalance = null;
            try {
                const authRes = await axios.post(
                    `${process.env.AUTH_SERVICE_URL || "http://localhost:8001"}/api/auth/add-coins`,
                    { userId, coins: payment.coins },
                    { headers: { "x-user-id": userId } }
                );
                newBalance = authRes.data?.interviewCoin;
            } catch (err) {
                newBalance = await updateUserCoinsDirect(userId, payment.coins);
            }

            return res.status(200).json({
                success: true,
                message: "Simulated payment verified! Coins added to your account.",
                payment,
                newBalance,
            });
        }

        // Real Razorpay signature verification
        const secret = process.env.RAZORPAY_KEY_SECRET?.trim()?.replace(/^["']|["']$/g, "");
        const generatedSignature = crypto
            .createHmac("sha256", secret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            payment.status = "failed";
            await payment.save();
            return res.status(400).json({
                success: false,
                message: "Payment verification failed: Signature mismatch",
            });
        }

        payment.paymentId = razorpay_payment_id;
        payment.signature = razorpay_signature;
        payment.status = "completed";
        await payment.save();

        let newBalance = null;
        try {
            const authRes = await axios.post(
                `${process.env.AUTH_SERVICE_URL || "http://localhost:8001"}/api/auth/add-coins`,
                { userId, coins: payment.coins },
                { headers: { "x-user-id": userId } }
            );
            newBalance = authRes.data?.interviewCoin;
        } catch (err) {
            newBalance = await updateUserCoinsDirect(userId, payment.coins);
        }

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully! Coins added to your wallet.",
            payment,
            newBalance,
        });
    } catch (error) {
        console.error("Verify payment error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to verify payment",
        });
    }
};

export const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User session required",
            });
        }

        const payments = await Payment.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            payments,
        });
    } catch (error) {
        console.error("Get payment history error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to retrieve payment history",
        });
    }
};
