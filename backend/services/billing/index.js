import express from "express";
import dotenv from "dotenv";
import dns from "dns";
import { connectDB } from "./config/db.js";
import billingRouter from "./routes/billing.route.js";

dotenv.config();

dns.setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 8005;

app.get("/", (req, res) => {
    res.send("Hello from Billing-service");
});

app.use("/", billingRouter);
app.use("/api/billing", billingRouter);

app.listen(PORT, () => {
    console.log(`Billing-service Started on port ${PORT}`);
    connectDB();
});
