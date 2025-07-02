import { useState } from "react"
import { Link } from "react-router"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { axiosService } from "../lib/axios.js"

const SignupPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  })

  const queryClient = useQueryClient() //gives access to the global query cache
  //we use tanstack useMutation for any operation that changes data and POST
  const { mutate, isPending, error } = useMutation({ //mutate is returned function to trigger mutation, isPending says if request is currently in flight
    mutationFn: async () => { //sends client POST request to our signup endpoint with user signup data
      const response = await axiosService.post("/auth/signup", signupData) 
      return response.data 
    },
    onSuccess:() => queryClient.invalidateQueries({ queryKey: ["authUser"] }), //this says authUser is stale since data has changed so it re-runs the /auth/me GET request in App.jsx 
  })

  //when signup form submitted, this is called, which sends form data and the POST request to create a new user
  const handleSignup = (e) => {
    e.preventDefault() //don't refresh page on submit
    mutate() //call our mutationFn
  }


  return (
    <div className="h-screen flex items-center justify-center p-4 sm:p-6 md:p-8" data-theme="cupcake">
      <div className="border border-primary/25 flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-xl shadow-lg overflow-hidden">

        {/* Signup form - left side*/}
        <div className="w-full lg:w-1/2 p-4 sm-:p-8 flex flex-col">
          {/* LOGO */}
          <div className="mb-4 flex items-center justify-start gap-2">
            <img src="/hualogo.png" alt="Hua Chat Logo"/>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error.response.data.message}</span> {/* error comes from axios, which comes from backend endpoints */}
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Create an Account, its free</h2>
                  <p>Talk Freely, Hua Easily</p>
                </div>

                {/* SIGNUP FORMS */}
                <div className="space-y-3">

                  {/* FULLNAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="example@gmail.com"
                      className="input input-bordered w-full"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="********"
                      className="input input-bordered w-full"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                    <p className="text-xs opacity-70 mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  {/* TERMS AND SERVICES */}
                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input type="checkbox" className="checkbox checkbox-sm" required />
                      <span className="text-xs leading-tight">
                        I agree to the{" "}
                        <span className="text-primary hover:underline">terms of service</span> and{" "}
                        <span className="text-primary hover:underline">privacy policy</span>
                      </span>
                    </label>
                  </div>
                </div>

                {/* visual spinner when user clicks create account */}
                <button className="btn btn-primary w-full" type="submit">
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                    </>
                  ) : ( "Create Account" )}
                </button>



                <div className="text-center mt-4">
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>


              </div>


            </form>
          </div>


        </div>
        
        {/* Signup form - right side*/}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-primary/10 items-center justify-center">
          <div className="max-w-md p-8">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto mt-8">
              <img src="/demogif2.gif" alt="App demo gif" className="rounded-lg w-full h-[280px] mb-8" />
            </div>

            <div className="text-center space-y-3 mt">
              <h2 className="text-xl font-semibold">Moments Shared, Memories Made</h2>
              <p className="opacity-70">
                With Hua, you can add friends, jump into seamless video calls, text chat, and even share images—all in one place.
              </p>
            </div>
          </div>
        </div>
        

      </div>
    </div>
  )
}

export default SignupPage