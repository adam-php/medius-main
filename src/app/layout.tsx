import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Medius',
  description: 'version 1',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          rootBox: 'w-full',
          card: 'bg-black border border-gray-800',
          headerTitle: 'text-white',
          headerSubtitle: 'text-gray-400',
          socialButtonsBlockButton: 'bg-black border border-gray-800 text-white hover:bg-gray-900',
          dividerLine: 'bg-gray-800',
          dividerText: 'text-gray-400',
          formFieldLabel: 'text-white',
          formFieldInput: 'bg-black border border-gray-800 text-white focus:border-orange-500',
          footerActionText: 'text-gray-400',
          footerActionLink: 'text-orange-500 hover:text-orange-400',
        }
      }}
    >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
          {children}
          <div id="toaster" className="fixed bottom-4 right-4 z-50" />
          <Toaster></Toaster>
        </body>
      </html>
    </ClerkProvider>
  )
}
