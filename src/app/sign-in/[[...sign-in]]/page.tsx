"use client"

import { SignIn } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"

export default function SignInForm() {
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
          <h1 className="text-xl font-semibold text-white">Sign in to your account</h1>

          {/* Clerk SignIn Component */}
          <SignIn
            path="/sign-in"
            routing="path"
            redirectUrl="/dashboard"
            afterSignInUrl="/dashboard"
            appearance={{
              layout: {
                socialButtonsPlacement: "top",
                socialButtonsVariant: "iconButton",
              },
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton__discord: "w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md py-2 flex items-center justify-center",
                socialButtonsBlockButton__google: "w-full bg-white hover:bg-gray-100 text-gray-800 rounded-md py-2 flex items-center justify-center",
                socialButtonsIcon: "mr-2 h-5 w-5",
                dividerLine: "bg-gray-700",
                dividerText: "bg-black text-gray-400 text-xs",
                formFieldLabel: "text-sm text-gray-300",
                formFieldInput: "w-full bg-[#111] text-white placeholder-gray-500 py-2 px-3 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500/50",
                formButtonPrimary: "w-full mt-6 bg-transparent hover:bg-orange-900/20 text-white border border-orange-500 shadow-[0_0_15px_rgba(255,150,0,0.5),0_0_30px_rgba(255,150,0,0.3)] rounded-md",
                footerActionText: "text-gray-400 text-xs",
                footerActionLink: "text-gray-400 hover:text-white hover:text-shadow-[0_0_8px_rgba(255,150,0,0.5)]",
              },
            }}
          />

          {/* Sign up link */}
          <p className="text-sm text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="text-gray-300 hover:text-white hover:text-shadow-[0_0_8px_rgba(255,150,0,0.5)]"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}