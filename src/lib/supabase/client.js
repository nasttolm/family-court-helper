import { createBrowserClient } from '@supabase/ssr'

// Create Supabase client for browser (client-side)
// Use this in 'use client' components
// IMPORTANT: Must use createBrowserClient from @supabase/ssr for Next.js App Router
// to ensure cookies are properly synchronized with server-side
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
