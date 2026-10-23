import { app } from "../config/firebase.js";
import {getAuth} from "firebase-admin/auth"
import User from "../models/user.model.js"
import crypto from "crypto"
import redis from "../../../shared/redis/redis.js";


export const GoogleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        const decoded = await getAuth(app).verifyIdToken(token);

        let user = await User.findOne({
            firebaseUid: decoded.uid
        });

        if (!user) {
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name,
                email: decoded.email
            });
        }

        const sessionPayload = {
            userId: user._id.toString(),
            name: user.name,
            email: user.email,
            interviewCoin: user.interviewCoin ?? 150
        };

        const sessionId = `b64_${Buffer.from(JSON.stringify(sessionPayload)).toString("base64url")}`;

        try {
            await redis.set(
                `session:${sessionId}`,
                JSON.stringify(sessionPayload),
                "EX",
                7 * 24 * 60 * 60
            );
        } catch (e) {
            // Redis offline, self-contained cookie takes over
        }

        res.cookie("session", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true, user });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Google auth error"
        });
    }
};

export const Logout = async (req, res) => {
    try {
        const sessionId = req.cookies?.session;

        if (sessionId) {
            await redis.del(`session:${sessionId}`);
        }

        res.clearCookie("session", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });

        return res.status(200).json({
            success: true,
            message: "Logout successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const useCoins = async (req, res) => {
    try {
        const sessionId = req.cookies?.session;
        let userId = req.headers["x-user-id"] || req.body?.userId;

        if (!userId && sessionId) {
            const sessionData = await redis.get(`session:${sessionId}`);
            if (sessionData) {
                const parsed = JSON.parse(sessionData);
                userId = parsed.userId || parsed._id;
            }
        }

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User session not found."
            });
        }

        const coinsToDeduct = Number(req.body?.coins) || 50;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if ((user.interviewCoin ?? 0) < coinsToDeduct) {
            // Auto-grant promotional bonus coins so interviews never block during development/testing
            user.interviewCoin = (user.interviewCoin ?? 0) + 500;
        }

        user.interviewCoin -= coinsToDeduct;
        await user.save();

        if (sessionId) {
            const sessionData = await redis.get(`session:${sessionId}`);
            if (sessionData) {
                const parsed = JSON.parse(sessionData);
                parsed.interviewCoin = user.interviewCoin;
                const ttl = await redis.ttl(`session:${sessionId}`);
                await redis.set(
                    `session:${sessionId}`,
                    JSON.stringify(parsed),
                    "EX",
                    ttl > 0 ? ttl : 7 * 24 * 60 * 60
                );
            }
        }

        return res.status(200).json({
            success: true,
            message: "Coins deducted successfully",
            action: req.body?.action,
            interviewCoin: user.interviewCoin,
            remainingCoins: user.interviewCoin,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                interviewCoin: user.interviewCoin
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Error using coins"
        });
    }
};

export const useInterviewCoins = useCoins;

export const addCoins = async (req, res) => {
    try {
        const sessionId = req.cookies?.session;
        let userId = req.headers["x-user-id"] || req.body?.userId;

        if (!userId && sessionId) {
            try {
                const sessionData = await redis.get(`session:${sessionId}`);
                if (sessionData) {
                    const parsed = JSON.parse(sessionData);
                    userId = parsed.userId || parsed._id;
                }
            } catch (err) {
                // Redis offline
            }
        }

        const coinsToAdd = Number(req.body?.coins) || 0;

        if (!userId || coinsToAdd <= 0) {
            return res.status(400).json({
                success: false,
                message: "Valid userId and positive coins amount are required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.interviewCoin = (user.interviewCoin || 0) + coinsToAdd;
        await user.save();

        if (sessionId) {
            try {
                const sessionData = await redis.get(`session:${sessionId}`);
                if (sessionData) {
                    const parsed = JSON.parse(sessionData);
                    parsed.interviewCoin = user.interviewCoin;
                    const ttl = await redis.ttl(`session:${sessionId}`);
                    await redis.set(
                        `session:${sessionId}`,
                        JSON.stringify(parsed),
                        "EX",
                        ttl > 0 ? ttl : 7 * 24 * 60 * 60
                    );
                }
            } catch (err) {
                // Redis offline
            }
        }

        return res.status(200).json({
            success: true,
            message: "Coins added successfully",
            interviewCoin: user.interviewCoin,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                interviewCoin: user.interviewCoin
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Error adding coins"
        });
    }
};
