import express from "express"
import { GoogleAuth, Logout, useCoins, addCoins } from "../controllers/auth.controller.js"

const authRouter = express.Router()


authRouter.post("/login",GoogleAuth)

//http://localhost:8000/api/auth/login

authRouter.get("/logout",Logout)

authRouter.post("/use-coins", useCoins)
authRouter.post("/usecoins", useCoins)
authRouter.post("/add-coins", addCoins)
authRouter.post("/addcoins", addCoins)

export default authRouter

