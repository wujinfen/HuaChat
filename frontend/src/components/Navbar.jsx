import { useLocation, Link } from "react-router"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosService } from "../lib/axios.js"

import ThemeSelector from "./ThemeSelector.jsx"
import { BellIcon, LogOutIcon } from "lucide-react"

const Navbar = () => {
    
  const queryClient = useQueryClient() //gives access to the global query cache
    const { data:authData, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
        try{
            const response = await axiosService.get("/auth/me")
            return response.data
        } catch (error) {
            return null //when this returns null, there is no auth user and it redirects back to the login page
        }
    },
    retry: false //doesn't call endpoint multiple times on auth failure
  }) 
  const authUser = authData?.user

  const location = useLocation()
  const isChatPage = location.pathname?.startsWith("/chat")

  const { mutate:logoutMutation } = useMutation({
    mutationFn: async () => {
        const response = await axiosService.post("/auth/logout")
        return response.data
    },
    onSuccess: () => queryClient.invalidateQueries({queryKey: ["authUser"]})
  })


  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-end w-full">
                {/* LOGO - ONLY IN THE CHAT PAGE */}
                {isChatPage && (
                <div className="pl-5">
                    <Link to="/" className="flex items-center gap-2.5">
                        <img src ="/hua1.png" alt="hua logo" width="60" height="100" />
                    </Link>
                </div>
                )}

                <div className="flex items-center gap-3 sm:gap-4 ml-auto">
                    <Link to={"/notifications"}>
                        <button className="btn btn-ghost btn-circle">
                            <BellIcon className="h-6 w-6 text-base-content opacity-70" />
                        </button>
                    </Link>
                </div>

                <ThemeSelector />

                <div className="avatar">
                    <div className="w-9 rounded-full">
                    <img src={authUser?.profilePic} alt="Profile Picture" rel="noreferrer" />
                    </div>
                </div>

                {/* Logout button */}
                <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
                    <LogOutIcon className="h-6 w-6 text-base-content opacity-70" />
                </button>

            </div>
        </div>
    </nav>
  )
}

export default Navbar