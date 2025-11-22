import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Update Supabase session
  const { supabaseResponse, user } = await updateSession(request)

  // Define protected routes (require authentication)
  const protectedRoutes = ['/dashboard', '/application', '/admin']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // If accessing protected route without authentication, redirect to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated user tries to access auth pages, redirect to dashboard
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname === route
  )

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
