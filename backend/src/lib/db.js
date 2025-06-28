import mongoose from "mongoose"

export const connectDB = async () => {
    try {
        const connStatus = await mongoose.connect(process.env.MONGO_URI)
        console.log(`Connected to MongoDB: ${connStatus.connection.host}`)
    } catch (error) {
        console.log(error)
    }
}