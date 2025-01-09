import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      // Clear any invalid auth cookies
      const response = NextResponse.redirect(`${new URL(request.url).origin}/auth/auth-code-error`)
      response.cookies.set('sb-access-token', '', { maxAge: 0 })
      response.cookies.set('sb-refresh-token', '', { maxAge: 0 })
      return response
    }

    return NextResponse.redirect(new URL(next, request.url))
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(
    `${new URL(request.url).origin}/auth/auth-code-error`
  )
}