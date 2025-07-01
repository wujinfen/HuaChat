import { useState, useEffect } from "react"
import { useParams } from "react-router"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { axiosService } from "../lib/axios"

import { StreamChat } from "stream-chat"
import { Channel, ChannelHeader, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react"


import toast from "react-hot-toast"

import ChatLoader from "../components/ChatLoader.jsx"
import CallButton from "../components/CallButton.jsx"

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

const ChatPage = () => {
  const { id: targetUserId } = useParams() //we use params to destructure the dynamic chat/:id from Route path in parent App.jsx <Route path="/chat/:id" ... />

  const [chatClient, setChatClient] = useState(null)
  const [channel, setChannel] = useState(null)
  const [loading, setLoading] = useState(true)

  const queryClient = useQueryClient() //gives access to the global query cache
  const { data:authData, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await axiosService.get("/auth/me")
      return response.data
    },
    retry: false //doesn't call endpoint multiple times on auth failure
  }) 
  const authUser = authData?.user


  const { data: tokenData } = useQuery({ //tokenData holds the data of the response
    queryKey: ["streamToken"], //cache key to get global data or manual refetch
    queryFn: async () => {
      const response = await axiosService.get("/chat/token")
      return response.data
    },
    enabled: !!authUser, //only runs when user authenticated
  })


  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authData) return;

      try {
        console.log("initializing stream chat client")

        const client = StreamChat.getInstance(STREAM_API_KEY)
        await client.connectUser({
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        }, tokenData.token)

        //idea is to sort the array and join both user ids make sure both users generate the same channel id even if authUserId and targetUserId is flipped; ex. user123-user456
        const channelId = [authUser._id, targetUserId].sort().join("-"); 

        //create/access a message channel with the id and the mumbers
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId]
        })

        await currChannel.watch() //starts live connection and pulls message history

        setChatClient(client)
        setChannel(currChannel)

      } catch (error) {
        console.error("error initializing chat:", error)
        toast.error("could not connect to chat, please try again")
      } finally {
        setLoading(false)
      }
    }
    initChat()
  }, [tokenData, authUser, targetUserId])

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `join videocall: ${callUrl}`,
      });
      toast.success("call started");
    }
  }

  if (loading || !chatClient || !channel) return <ChatLoader />

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient} > {/* this is why we need states for the chatClient and channel, that way it can save the state and re-render when the async setup is done*/}
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  )
}

export default ChatPage