import React from 'react'
import { Route, Routes } from "react-router"

import { Toaster } from "react-hot-toast"
import toast from "react-hot-toast"

import HomePage from "./pages/HomePage.jsx"
import SignupPage from "./pages/SignupPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import NotificationsPage from "./pages/NotificationsPage.jsx"
import CallPage from "./pages/CallPage.jsx"
import ChatPage from "./pages/ChatPage.jsx"
import OnboardingPage from "./pages/OnboardingPage.jsx"

const App = () => {

  
  return (
    <div className="h-screen" data-theme="dark">
      <div><Toaster/></div> {/* this adds Toaster to app (react notification)*/}
      <button onClick={()=>toast.success("button clicked")}>SAMPLE TOAST</button>

      {/* these are URL based routes in our frontend App that routes to the pages in src/pages */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/call" element={<CallPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Routes>
    
      
    </div>
    
  )
}

export default App
