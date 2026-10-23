import express from "express"
import dotenv from "dotenv"
import { connectDB} from "./config/database.js"
dotenv.config()
import dns from "dns"
import authRouter from "./routes/auth.route.js"
import cookieParser from "cookie-parser";
dns.setServers([
    '1.1.1.1',
    '8.8.8.8'
])

const app = express()

app.use(express.json())
app.use(cookieParser())


const PORT = process.env.PORT || 6001
app.get("/", (req,res)=>{
    res.send("Hello from Auth-Service!")
})

app.use("/",authRouter)


app.listen(PORT,()=>{
    console.log(`Auth-service is running on port ${PORT}`)
    connectDB()
})