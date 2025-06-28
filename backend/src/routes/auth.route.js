import express from "express"

//import API endpoint handlers
import { signup, login, logout, onboard } from "../controllers/auth.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout) //logout changes server state so it's a post 
router.post("/onboarding", protectRoute, onboard)

//this route checks if user is logged in and verified
router.get("/me", protectRoute, (request, response) => {
    response.status(200).json({ success: true, user: request.user})
})

export default router