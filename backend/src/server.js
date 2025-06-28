import express from "express"
import dotenv from "dotenv"
dotenv.config()
import cookieParser from "cookie-parser"

import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"

import { connectDB } from "./lib/db.js"

const app = express()
app.use(express.json())
app.use(cookieParser())

//mount routes to route prefix
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    connectDB();
})
