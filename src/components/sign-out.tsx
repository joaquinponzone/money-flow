"use client"

import { createBrowserClient } from "@supabase/ssr"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

export function SignOutButton() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleSignOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        return
      }
      
      // Clear any client-side state
      router.refresh()
      
      // Redirect to login page
      router.push('/auth/login')
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
    }
  }

  return (
    <Button variant="ghost" onClick={handleSignOut}>
      Sign Out
    </Button>
  )
} 