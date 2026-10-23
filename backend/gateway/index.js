import express from "express"
import dotenv from "dotenv"
dotenv.config()
import proxy from "express-http-proxy"
import cors from "cors"
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { isAuth } from "./middleware/isAuth.js";
import { getCurrentUser } from "./controllers/user.controllers.js";
import { proxywithHeaders } from "./utils/proxywithheaders.js";

const app = express()
app.use(express.json())
app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            origin.includes("localhost") ||
            origin.includes("127.0.0.1") ||
            origin.startsWith("http://localhost:") ||
            origin.startsWith("http://127.0.0.1:")
        ) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
}))


app.use(morgan("dev"))
app.use(cookieParser())


const PORT = process.env.PORT || 6000

app.get("/", (req, res) => {
    res.send("Hello from Gateway!")
})
import redis from "../shared/redis/redis.js";

app.get("/api/auth/dev-login", async (req, res) => {
    const sessionId = "93c36180-fef7-4ffe-b305-c74e2061a6f8";
    res.cookie("session", sessionId, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.redirect("http://localhost:5173/dashboard");
});

app.get("/api/auth/logout", async (req, res) => {
    try {
        const sessionId = req.cookies?.session;
        if (sessionId) {
            await redis.del(`session:${sessionId}`);
        }
        res.clearCookie("session", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/"
        });
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        res.clearCookie("session", { path: "/" });
        return res.status(200).json({ success: true });
    }
});

app.use("/api/auth", proxy(process.env.AUTH_SERVICE_URL))
app.use("/api/resume", isAuth, proxywithHeaders(process.env.RESUME_SERVICE_URL))
app.use("/api/interview", isAuth, proxywithHeaders(process.env.INTERVIEW_SERVICE_URL))
const optionalBillingAuth = (req, res, next) => {
    if (req.path === "/plans" || req.path === "/key") {
        return next();
    }
    return isAuth(req, res, next);
};

app.use("/api/roadmap", isAuth, proxywithHeaders(process.env.ROADMAP_SERVICE_URL || "http://localhost:8004"));
app.use("/api/billing", optionalBillingAuth, proxywithHeaders(process.env.BILLING_SERVICE_URL || "http://localhost:8005"));
app.get("/api/me", isAuth, getCurrentUser)


app.use((err, req, res, next) => {
    console.error("Gateway error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Gateway internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`Gateway is running on port ${PORT}`)
})