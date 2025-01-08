import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    if (!code) {
      console.error('No code provided in callback')
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    if (!data.session) {
      console.error('No session data received after code exchange')
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    // Set additional session verification
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error verifying user after session exchange:', userError)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }

    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }
}