import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  try {
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') || '/'

    if (code) {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth error:', error)
        // Redirect to login page of the current domain
        return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
      }
    }

    // Redirect to the next page on the current domain
    return NextResponse.redirect(`${requestUrl.origin}${next}`)
  } catch (error) {
    console.error('Callback error:', error)
    // Redirect to login page of the current domain
    return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
  }
} 