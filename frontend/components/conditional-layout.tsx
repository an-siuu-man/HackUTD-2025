"use client"

import { usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Check if current page is login or signup
  const isAuthPage = pathname === "/login" || pathname === "/signup"

  if (isAuthPage) {
    // Auth pages: full width, no sidebar
    return <main className="flex-1 overflow-y-auto w-full">{children}</main>
  }

  // Regular pages: with sidebar
  return (
    <>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </>
  )
}
