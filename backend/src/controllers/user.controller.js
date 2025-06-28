import User from "../models/User.js"




export async function getRecommendedUsers (request, response) {
    try {
        //in userRoute, protectRoute middleware is called, which adds user and its data fields to request
        const currentUserId = request.user.id; 
        const currentUser = request.user

        const recommendedUsers = await User.find({
            $and: [
                {_id: {$ne: currentUserId}}, //not current user
                {$id: {$nin: currentUser.friends}}, //not current user's friend
                {isOnboarded: true}
            ]
        })

        response.status(200).json(recommendedUsers)
    } catch (error) {
        console.error("Error in getRecommendedUsers controller", error)
        response.status(500).json({ message: "Server error occurred when fetching recommendations "})
    }
}

export async function getMyFriends (request, response) {
    try {
        const user = await User.findById(request.user.id).select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage") //replace objectId of friend's data with actual data
        
        response.status(200).json(user.friends)
    } catch (error) {
        console.error("Error in getMyFriends controller", error)
        response.status(500).json({ message: "Server error occurred when fetching friends "})
    }
}