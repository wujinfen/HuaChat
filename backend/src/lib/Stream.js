import { StreamChat } from "stream-chat"
import dotenv from "dotenv"
dotenv.config()

const apiKey = process.env.STREAM_API_KEY
const apiSecret = process.env.STREAM_API_SECRET

const streamClient = StreamChat.getInstance(apiKey, apiSecret)

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUsers([userData])
        return userData
    } catch (error) {
        console.log("Error creating user in Stream API:", error)
    }
}

export const generateStreamToken = (userId) => {
    try {
        const userIdString = userId.toString()
        return streamClient.createToken(userIdString)
    } catch (error) {
        console.log("Error generating Stream token:", error)
    }
}