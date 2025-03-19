"use client"
import { SignUp } from "@clerk/nextjs"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(194,101,15,0.3),rgba(255,0,0,0))]">
      <div className="w-full max-w-sm px-4">
        <div className="relative bg-zinc-950 rounded-2xl border border-zinc-800 p-6 shadow-2xl space-y-4">
          <h1 className="text-xl font-semibold tracking-tight text-white">Sign Up</h1>
          
          <SignUp 
            path="/sign-up"
            routing="path"
            redirectUrl="/dashboard"
            afterSignUpUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none p-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-zinc-800/50 border-zinc-700 text-white hover:bg-zinc-700/50",
                dividerLine: "bg-zinc-700",
                dividerText: "bg-zinc-950 px-2 text-zinc-400",
                formFieldInput: "bg-zinc-800/50 border-zinc-700 text-white text-sm",
                formButtonPrimary: "bg-[#C2650F] hover:bg-[#A85A0D] text-white",
                footerActionText: "text-zinc-400",
                footerActionLink: "text-[#C2650F] hover:text-[#D67A1F]"
              }
            }}
          />

          <div className="text-center text-zinc-400">
            Already have an account?{' '}
            <Link href="/sign-in" className="text-[#C2650F] hover:text-[#D67A1F]">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
