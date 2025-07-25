import React from 'react'
import { Route, Routes, Navigate } from "react-router"
import { useQuery, useMutation } from '@tanstack/react-query'
import { axiosService } from './lib/axios.js'

import { Toaster } from "react-hot-toast"
import toast from "react-hot-toast"

import PageLoader from './components/PageLoader.jsx'

import Layout from "./components/Layout.jsx"
import HomePage from "./pages/HomePage.jsx"
import SignupPage from "./pages/SignupPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import NotificationsPage from "./pages/NotificationsPage.jsx"
import CallPage from "./pages/CallPage.jsx"
import ChatPage from "./pages/ChatPage.jsx"
import OnboardingPage from "./pages/OnboardingPage.jsx"
import SearchFriends from './pages/SearchFriends.jsx'
import { useThemeStore } from './store/useThemeStore.js'

const App = () => {

  //tanstack query
  //once user logs in and gets authenticated, we keep the user state in memory in the root App component 
    //this state is global and allows the rest of the app and pages to trust the authenticated user and avoids repeating the '/auth/me' checks on every page
  const { data:authData, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const response = await axiosService.get("/auth/me")
      return response.data
    },
    retry: false //doesn't call endpoint multiple times on auth failure
  }) 
  const authUser = authData?.user
  const isOnboarded = authUser?.isOnboarded

  const { theme, setTheme } = useThemeStore() //global zustand theme variable

  if (isLoading) return <PageLoader /> 

  return (
    <div className="min-h-screen" data-theme={theme}>
      <div><Toaster/></div> {/* this adds Toaster to app (react notification)*/}
      {/* <button onClick={()=>toast.success("button clicked")}>SAMPLE TOAST</button> */}

      {/* these are URL based routes in our frontend App that routes to the pages in src/pages */}
      <Routes>
        {/* <Route path="/sample-url" element={<SamplePage />} />  */} 
        {/* if user is logged in and authenticated then they have access to specific pages */} 
        <Route path="/" element={ authUser && isOnboarded ? ( 
          <Layout showSidebar={true}> <HomePage /> </Layout>
        ) : (<Navigate to={!authUser ? "/login" : "/onboarding"} /> )} />

        <Route path="/signup" element={ !authUser ? <SignupPage /> : <Navigate to={ 
          isOnboarded ? "/" : "/onboarding"
        } /> } />

        <Route path="/login" element={ !authUser ? <LoginPage /> : <Navigate to={ 
          isOnboarded ? "/" : "/onboarding"
        } /> } />

        {/* TODO: CREATE THE SearchFriends Page*/}
        <Route path="/friends" element={ authUser && isOnboarded ? (
          <Layout showSidebar={true}> <SearchFriends /> </Layout>
        ) : (
          <Navigate to={!authUser ? "/login" : "/onboarding"} />
        ) } />

        <Route path="/notifications" element={ authUser && isOnboarded ? (
          <Layout showSidebar={true}> <NotificationsPage /> </Layout>
        ) : (
          <Navigate to={!authUser ? "/login" : "/onboarding"} />
        ) } />

        <Route path="/call/:id" element={ authUser && isOnboarded ? ( <CallPage /> ) : ( <Navigate to={ !authUser ? "/login" : "/onboarding"}/> ) } />

        <Route path="/chat/:id" element={ 
          authUser && isOnboarded ? (
            <Layout showSidebar={false}>
              <ChatPage />
            </Layout>
          ) : (
            <Navigate to={!authUser ? "/login" : "/onboarding"} />
          )
         } />

        <Route path="/onboarding"
          element={ authUser ? ( !isOnboarded ? ( <OnboardingPage />) : ( <Navigate to="/" /> )) : 
            ( <Navigate to="/login" /> )}/>
      </Routes>
    
      
    </div>
    
  )
}

export default App
