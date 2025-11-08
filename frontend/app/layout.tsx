import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins, Lora } from "next/font/google"
import "./globals.css"
import { ConditionalLayout } from "@/components/conditional-layout"
import { AuthProvider } from "@/lib/auth-context"

// Main body text - Inter
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

// Headings - Poppins (modern, bold)
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

// Subheadings - Lora (elegant, readable)
const lora = Lora({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
})

export const metadata: Metadata = {
  title: "T&C Guardian - Terms & Conditions Analysis",
  description: "Analyze and understand terms and conditions with AI",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} ${lora.variable} font-sans antialiased`}>
        <AuthProvider>
          <div className="flex h-screen bg-gray-50">
            <ConditionalLayout>{children}</ConditionalLayout>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
