import { createClient } from '@/lib/supabase/server'
import { DEFAULT_FORM_CONFIG } from './defaultFormConfig'

// Import default config from centralized location

/**
 * Load form configuration from database (server-side only)
 * Used in API routes and server components
 * @returns {Promise<Object>} Form configuration
 */
export async function loadFormConfigServer() {
  try {
    const supabase = await createClient()

    // Get active form config
    const { data: activeConfig, error } = await supabase
      .from('form_configs')
      .select('config')
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('[Form Config Server] Error loading config:', error)
      return DEFAULT_FORM_CONFIG
    }

    if (!activeConfig) {
      console.warn('[Form Config Server] No active config found, using default')
      return DEFAULT_FORM_CONFIG
    }

    return activeConfig.config
  } catch (error) {
    console.error('[Form Config Server] Unexpected error:', error)
    return DEFAULT_FORM_CONFIG
  }
}

/**
 * Get form configuration version (server-side only)
 * @returns {Promise<number>} Version number
 */
export async function getFormVersionServer() {
  try {
    const supabase = await createClient()

    const { data: activeConfig, error } = await supabase
      .from('form_configs')
      .select('version')
      .eq('is_active', true)
      .single()

    if (error || !activeConfig) {
      return 1
    }

    return activeConfig.version
  } catch (error) {
    console.error('[Form Config Server] Error getting version:', error)
    return 1
  }
}
