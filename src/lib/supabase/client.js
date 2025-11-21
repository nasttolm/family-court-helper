import { createClient } from '@supabase/supabase-js'

// Create Supabase client for browser (client-side)
// Use this in 'use client' components
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
