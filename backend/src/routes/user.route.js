import express from "express"

import { protectRoute } from "../middleware/auth.middleware.js"
import { getRecommendedUsers, getMyFriends, sendFriendRequest } from "../controllers/user.controller.js"

const router = express.Router()
router.use(protectRoute) //apply protectRoute middleware to all routes in this router

router.get("/", getRecommendedUsers)
router.get("/friends", getMyFriends)
router.post("/friend-request/:id", sendFriendRequest)



export default router