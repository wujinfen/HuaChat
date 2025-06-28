import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protectRoute = async (request, response, next) => {
    try {
        const token = request.cookies.jwt //get cookie containing our jwt
        if (!token) {
            return response.status(401).json({ message: "Unauthorized - Missing Token" })
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        if (!decodedToken) {
            return response.status(401).json({ message: "Unauthorized - Wrong Token" })
        }

        //get User document info without the user password
        const user = await User.findById(decodedToken.userId).select("-password")
        if (!user) {
            return response.status(401).json({ message: "Unauthorized - No User" })
        }

        //add user info to the request object
        //therefore routes that need user info need to be protected with this protectRoute() func
        request.user = user 

        next() //go to actual route handler
    } catch (error) {
        console.error("Error in protectRoute token verification", error)
        return response.status(500).json({ message: "Internal server token verification error" })
    }
}