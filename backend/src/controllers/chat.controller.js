import { generateStreamToken } from "../lib/Stream.js"


export async function getStreamToken(request, response) {
    try {
        const token = generateStreamToken(request.user.id)
        
        response.status(200).json({ token })
    } catch (error) {
        console.error("Error in getStreamToken controller:", error)
        response.status(500).json({ message: "Internal Stream token error in controller "})
    }
}