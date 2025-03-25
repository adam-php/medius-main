"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="w-full max-w-md rounded-lg bg-black p-8 shadow-lg relative">
        {/* Enhanced orange glow effect with wider radius */}
        <div className="absolute inset-0 rounded-lg border border-orange-500 shadow-[0_0_50px_rgba(255,150,0,0.5),0_0_100px_rgba(255,150,0,0.3)] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center space-y-6">
          {/* Logo */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black overflow-hidden">
            <Image src="/images/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
          </div>

          {/* Heading */}
          <h1 className="text-xl font-semibold text-white">Create your account</h1>

          {/* Auth buttons */}
          <div className="w-full space-y-3">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <DiscordIcon className="mr-2 h-5 w-5" />
              Continue with Discord
            </Button>

            <Button className="w-full bg-white hover:bg-gray-100 text-gray-800">
              <GoogleIcon className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>
          </div>

          {/* Divider */}
          <div className="flex w-full items-center gap-2">
            <div className="h-px flex-1 bg-gray-700"></div>
            <span className="text-xs text-gray-400">Or with email</span>
            <div className="h-px flex-1 bg-gray-700"></div>
          </div>

          {/* Form */}
          <form className="w-full space-y-4">
            <div className="space-y-1">
              <label htmlFor="username" className="text-sm text-gray-300">
                Username
              </label>
              <div className="flex">
                {/* Prefix as a separate element */}
                <div className="flex items-center rounded-l-md bg-[#111] px-3 py-2 text-sm text-gray-500 border-r border-gray-800">
                  hello.com/
                </div>
                {/* Username input field */}
                <input
                  type="text"
                  id="username"
                  placeholder="Choose your username"
                  className="w-full rounded-r-md bg-[#111] py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-sm text-gray-300">
                Email
              </label>
              <div className="flex rounded-md bg-[#111]">
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full bg-transparent py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
                <span className="flex items-center pr-3 text-gray-500">📧</span>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-sm text-gray-300">
                Password
              </label>
              <div className="flex rounded-md bg-[#111]">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Create a password"
                  className="w-full bg-transparent py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center pr-3 text-gray-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-6 bg-transparent hover:bg-orange-900/20 text-white border border-orange-500 shadow-[0_0_15px_rgba(255,150,0,0.5),0_0_30px_rgba(255,150,0,0.3)]"
            >
              Create Account
            </Button>
          </form>

          {/* Login link */}
          <p className="text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-gray-300 hover:text-white hover:text-shadow-[0_0_8px_rgba(255,150,0,0.5)]"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Discord icon from simple-icons
function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fill="currentColor"
        d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z"
      />
    </svg>
  )
}

// Google icon component
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
      <path fill="none" d="M1 1h22v22H1z" />
    </svg>
  )
}

