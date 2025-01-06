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
      await supabase.auth.signOut()
      router.refresh()
    }
  
    return (
      <Button variant="ghost" onClick={handleSignOut}>
        Sign Out
      </Button>
    )
  } 