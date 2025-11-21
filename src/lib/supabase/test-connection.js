import { supabase } from './client'

// Test Supabase connection
// This checks if we can connect to Supabase
export async function testConnection() {
  try {
    // Try to get current session (will return null if not logged in, but connection works)
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Supabase connection error:', error)
      return { success: false, error: error.message }
    }

    console.log('Supabase connection successful!')
    return {
      success: true,
      session: data.session,
      message: 'Connected to Supabase successfully'
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { success: false, error: error.message }
  }
}
