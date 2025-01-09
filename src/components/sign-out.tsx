"use client"

import { createBrowserClient } from "@supabase/ssr"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"

export function SignOutButton() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) {
        console.error('Error signing out:', error)
        return
      }
      
      // Clear any client-side state
      router.refresh()
      
      // Force a hard reload to clear all state
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
    }
  }

  return (
    <>
      <Button variant="ghost" className="hidden md:block" onClick={handleSignOut}>
        Sign Out
      </Button>
      <span className={`text-sm font-medium transition-colors text-foreground block md:hidden`}>
          <LogOutIcon className="size-6" />
        </span>
    </>

  )
}