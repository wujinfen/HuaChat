/*
 * API Endpoint Handlers for user reg, login, logout, and onboarding
 */

import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

import User from "../models/User.js"
import { upsertStreamUser } from "../lib/Stream.js"


export async function signup(request, response) {
    const { fullName, email, password } = request.body

    try {
        //signup error handling -- 400 is client error
        if (!fullName || !email || !password) {
            return response.status(400).json({ message: "Please fill out all required fields" })
        }
        if (password.length < 8) {
            return response.status(400).json({ message: "Password must contain at least 8 characters" })
        }

        const userAlreadyExists = await User.findOne({ email })
        if (userAlreadyExists) {
            return response.status(400).json({ message: "Email already in use. Please register with a different email" })
        }

        const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailFormat.test(email)) {
        return response.status(400).json({ message: "Email format is invalid" });
        }

        //used https://avatar-placeholder.iran.liara.run/ api to generate random initial profile pic
        const initialPfp = `https://avatar.iran.liara.run/username?username=${fullName}`

        //create and save new User to our users mongodb collection
        const newUser = new User({
            email,
            fullName,
            password,
            profilePic: initialPfp
        })
        await newUser.save()

        //create new user in Stream as well
        await upsertStreamUser ({
            id: newUser._id.toString(),
            name: newUser.fullName,
            image: newUser.profilePic || "",
        })

        //create a jwt for auth
        const token = jwt.sign({userId:newUser._id}, process.env.JWT_SECRET, {expiresIn: "7d"})
        response.cookie("jwt", token, {
            maxAge: 7*24*60*60*1000, //7 days - from ms
            httpOnly: true, //prevent XSS attack
            sameSite: "strict", //prevent CSRF attack
            secure: process.env.NODE_ENV==="production"
        })

        //send a successful response containing newly created user
        response.status(201).json({success:true, user:newUser}) 
    } catch (error) {
        console.error("Signup error:", error)
        response.status(500).json({ message: "Server error occured during signup"}) 
    }
}

export async function login(request, response) {
    try {
        const { email, password } = request.body

        if (!email || !password) {
            return response.status(400).json({ message: "Please fill out all required fields "})
        }

        const user = await User.findOne({ email }) 
        if (!user) {
            return response.status(401).json({ message: "Invalid email or password" }) //401: unauthorized response
        }

        //compare password to hashed bcrypt encrypted password
        const verifyPassword = await bcrypt.compare(password, user.password) 
        if (!verifyPassword) {
            return response.status(401).json({ message: "Invalid email or password" }) 
        }

        //create a jwt for auth
        const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn: "7d"})
        response.cookie("jwt", token, {
            maxAge: 7*24*60*60*1000, //7 days - from ms
            httpOnly: true, //prevent XSS attack
            sameSite: "strict", //prevent CSRF attack
            secure: process.env.NODE_ENV==="production"
        })

        response.status(200).json({ success: true, user })
    } catch (error) {
        console.error("Login error:", error)
        response.status(500).json({ message: "Server error occured during login"}) 
    }
}

export async function logout(request, response) {
    response.clearCookie("jwt")
    response.status(200).json({ success: true, message: "Logout successful" })
}

export async function onboard(request, response) {
    try {
        const userId = request.user._id
        const { fullName, bio, nativeLanguage, learningLanguage, location } = request.body
        //note: not making these fields required for privacy reasons

        //update user in db with onboarding info
        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...request.body,
            isOnboarded: true
        }, {new: true})

        //send updates to Stream
        await upsertStreamUser({
            id: updatedUser._id.toString(),
            name: updatedUser.fullName,
            image: updatedUser.profilePic || "",
        })

        response.status(200).json({ success: true, user: updatedUser })
    } catch (error) {
        console.error("Onboard error:", error)
        response.status(500).json({ message: "Server error occured during onboarding"}) 
    }
}