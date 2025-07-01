import { useParams, useNavigate } from "react-router"
import { useState, useEffect } from "react"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { axiosService } from "../lib/axios"

import { StreamVideo, StreamVideoClient, StreamCall, CallControls, SpeakerLayout, StreamTheme, CallingState, useCallStateHooks,} from "@stream-io/video-react-sdk"
import "@stream-io/video-react-sdk/dist/css/styles.css"

import toast from "react-hot-toast"

import ChatLoader from "../components/ChatLoader"

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY

const CallPage = () => {
  const { id: callId } = useParams(null)
  const [ client, setClient ] = useState(null)
  const [ call, setCall ] = useState(null)
  const [ isConnecting, setIsConnecting] = useState(true)

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
    const initCall = async () => {
      if (!tokenData.token || !authUser || !callId) return;

      try {
        console.log("initializing stream chat client")

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser.profilePic,
        }

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        })

        const callInstance = videoClient.call("default", callId)
        await callInstance.join({ create: true }) //call will be created if it doesnt exist

        setClient(videoClient)
        setCall(callInstance)

      } catch (error) {
        console.error("error during call", error)
        toast.error("could not join call, please try again")
      } finally {
        setIsConnecting(false)
      }
    }
    initCall()
  }, [tokenData, authUser, callId])


  if (isLoading || isConnecting) return <ChatLoader />

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};


export default CallPage