import User from "../models/User.js"
import FriendRequest from "../models/FriendRequest.js"


export async function getRecommendedUsers (request, response) {
    try {
        //in userRoute, protectRoute middleware is called, which adds user and its data fields to request
        const currentUserId = request.user.id; 
        const currentUser = request.user

        const recommendedUsers = await User.find({
            $and: [
                {_id: {$ne: currentUserId}}, //not current user
                {_id: {$nin: currentUser.friends}}, //not current user's friend
                {isOnboarded: true} //can remove to not show onboarded accounts
            ]
        })

        response.status(200).json(recommendedUsers)
    } catch (error) {
        console.error("Error in getRecommendedUsers controller", error)
        response.status(500).json({ message: "Server error occurred when fetching recommendations" })
    }
}


export async function getMyFriends (request, response) {
    try {
        const user = await User.findById(request.user.id).select("friends")
            .populate("friends", "fullName profilePic nativeLanguage learningLanguage") //replace objectId of friend's data with actual data
        
        response.status(200).json(user.friends)
    } catch (error) {
        console.error("Error in getMyFriends controller", error)
        response.status(500).json({ message: "Server error occurred when fetching friends" })
    }
}


export async function sendFriendRequest(request, response) {
    try {
        const myId = request.user.id
        const recipientId = request.params.id //get dynamic id from route

        if (myId === recipientId) {
            return response.status(400).json({ message: "Cannot send friend request to yourself" })
        }

        const recipient = await User.findById(recipientId)
        if (!recipient) {
            return response.status(404).json({ message: "Recipient not found" })
        }
        if (recipient.friends.includes(myId)) {
            return response.status(400).json({ message: `Already friends with ${recipient.fullName}` })
        }
        
        const existingRequest = await FriendRequest.findOne({
            $or: [
                {sender: myId, recipient: recipientId},
                {sender: recipientId, recipient: myId},
            ],
        })
        if (existingRequest) {
            return response.status(400).json({ message: "There is already a friend request between you and this user" })
        }

        //once all error checks pass, we create and save a new valid friend request
        const friendRequest = new FriendRequest({
            sender: myId,
            recipient: recipientId,
        })
        await friendRequest.save()

        response.status(201).json(friendRequest)
    } catch (error) {
        console.error("Error in getMyFriends controller", error)
        response.status(500).json({ message: "Server error occurred when sending friend request" })
    }
}


export async function acceptFriendRequest(request, response) {
    try {
        const requestId = request.params.id
        const friendRequest = await FriendRequest.findById(requestId)

        if (!friendRequest) {
            return response.status(404).json({ message: "Friend request not found" })
        }

        if (friendRequest.recipient.toString() !== request.user.id) {
            return response.status(403).json({ message: "Not Authorized"})
        }

        //change friend request status to accepted
        friendRequest.status = "accepted"
        await friendRequest.save()

        //update friends array of both users
        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        })
        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }
        })

        response.status(200).json({ message: "Friend request accepted" })
    } catch (error) {
        console.error("Error in acceptFriendRequest handler", error)
        response.status(500).json({ message: "Server error occurred when accepting friend request" })
    }
}

export async function getFriendRequests(request, response) {
    try {
        //find request
        const incomingRequests = await FriendRequest.find({
            recipient: request.user.id,
            status: "pending"
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage")

        const acceptedRequests = await FriendRequest.find({
            sender: request.user.id,
            status: "accepted"
        }).populate("recipient", "fullName profilePic")

        response.status(200).json({ incomingRequests, acceptedRequests })
    } catch(error) {
        console.error("Error in getFriendResponse handler", error)
        response.status(500).json({ message: "Server error occurred when getting friend requests" })
    }
}

export async function getOutgoingFriendRequests(request, response) {
    try {
        const outgoingRequests = await FriendRequest.find({
            sender: request.user.id,
            status: "pending"
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage")

        response.status(200).json({ outgoingRequests })
    } catch(error) {
        console.error("Error in getOutgoingFriendRequests handler", error)
        response.status(500).json({ message: "Server error occurred when getting outgoing friend requests" })
    }
}

export async function searchUsers(request, response) {
  try {
    const query = request.query.query?.toLowerCase();
    const currentUserId = request.user.id;

    if (!query || query.trim() === "") {
      return response.status(400).json({ message: "Search query required" });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        {
          $or: [
            { fullName: { $regex: query, $options: "i" } },
            { email: { $regex: query, $options: "i" } }
          ]
        }
      ]
    }).limit(10).select("fullName email profilePic");

    response.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUsers controller", error);
    response.status(500).json({ message: "Server error occurred when searching users" });
  }
}