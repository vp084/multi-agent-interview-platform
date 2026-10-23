import express from "express"
import dotenv from "dotenv"
import dns from "dns"
import { connectDB } from "./config/db.js"
import ResumeRouter from "./routes/resume.route.js"
dotenv.config()

dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])

const app = express()

app.use(express.json())

const PORT = process.env.PORT || 6002

app.get("/", (req, res) => {
    res.send("Hello from Resume-Service!")
})

app.get("/health", (req, res) => {
    res.send("Hello from Resume-Service!")
})

app.use("/", ResumeRouter)
app.use("/api", ResumeRouter)

app.listen(PORT, () => {
    console.log(`Resume service started on ${PORT}`)
    connectDB()
})