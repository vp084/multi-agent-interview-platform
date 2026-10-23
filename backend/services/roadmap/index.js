import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import { connectDB } from "./config/db.js";
import roadmapRouter from "./routes/roadmap.route.js";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8004;

app.get("/", (req, res) => {
    res.send("Hello from Roadmap-service");
});

app.use("/", roadmapRouter);
app.use("/api/roadmap", roadmapRouter);

app.listen(PORT, () => {
    console.log(`Roadmap-service Started on port ${PORT}`);
    connectDB();
});
