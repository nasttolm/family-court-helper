import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Update Supabase session
  const { supabaseResponse, user } = await updateSession(request)

  const pathname = request.nextUrl.pathname

  // Define public routes (no authentication required)
  const publicRoutes = ['/application/guest']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Skip authentication check for public routes
  if (isPublicRoute) {
    return supabaseResponse
  }

  // Define protected routes (require authentication)
  const protectedRoutes = ['/dashboard', '/application', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // If accessing protected route without authentication, redirect to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If authenticated user tries to access auth pages, redirect to dashboard
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some(route => pathname === route)

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
