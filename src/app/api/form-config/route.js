import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_FORM_CONFIG } from '@/lib/form/defaultFormConfig'

// Import default config from centralized location (see @/lib/form/defaultFormConfig.js)

// GET /api/form-config - Get active form configuration
export async function GET(request) {
  console.log('[Form Config API] ========== GET CALLED ==========')

  try {
    const supabase = await createClient()

    console.log('[Form Config API] Fetching active config...')
    // Get active form config
    const { data: activeConfig, error } = await supabase
      .from('form_configs')
      .select('*')
      .eq('is_active', true)
      .single()

    console.log('[Form Config API] Query result:', {
      found: !!activeConfig,
      error: error?.code,
      errorMessage: error?.message
    })

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      console.error('[Form Config API] Error fetching config:', error)
      throw error
    }

    // If no active config exists, create default
    if (!activeConfig) {
      console.log('[Form Config API] No active config found, creating default...')
      console.log('[Form Config API] Using Service Role Key:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

      // Use service role to bypass RLS for auto-creation
      const { createClient: createServiceClient } = await import('@supabase/supabase-js')
      const supabaseAdmin = createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      const { data: newConfig, error: insertError } = await supabaseAdmin
        .from('form_configs')
        .insert([
          {
            version: 1,
            config: DEFAULT_FORM_CONFIG,
            is_active: true,
            notes: 'Default configuration (auto-created)'
          }
        ])
        .select()
        .single()

      if (insertError) {
        console.error('[Form Config API] Error creating default config:', insertError)
        console.error('[Form Config API] Insert error details:', insertError.details)
        console.error('[Form Config API] Insert error hint:', insertError.hint)
        // Return default config even if DB insert fails
        return NextResponse.json({
          config: DEFAULT_FORM_CONFIG,
          version: 1,
          fromDatabase: false,
          error: insertError.message
        })
      }

      console.log('[Form Config API] Default config created successfully!')

      const response = NextResponse.json({
        config: newConfig.config,
        version: newConfig.version,
        id: newConfig.id,
        fromDatabase: true
      })

      // Add cache-busting headers
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')

      return response
    }

    const response = NextResponse.json({
      config: activeConfig.config,
      version: activeConfig.version,
      id: activeConfig.id,
      fromDatabase: true
    })

    // Add cache-busting headers to prevent browser caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('[Form Config API] Unexpected error:', error)
    // Return default config as fallback
    return NextResponse.json({
      config: DEFAULT_FORM_CONFIG,
      version: 1,
      fromDatabase: false,
      error: error.message
    })
  }
}

// POST /api/form-config - Save new form configuration
export async function POST(request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { config, notes } = body

    if (!config) {
      return NextResponse.json({ error: 'Config is required' }, { status: 400 })
    }

    // Use Service Role client to bypass RLS for updates
    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get current max version
    const { data: latestConfig } = await supabaseAdmin
      .from('form_configs')
      .select('version')
      .order('version', { ascending: false })
      .limit(1)
      .single()

    const newVersion = (latestConfig?.version || 0) + 1

    // Deactivate ALL existing configs using admin client (bypass RLS)
    console.log('[Form Config API] Deactivating all existing configs using admin client...')
    const { error: deactivateError, count } = await supabaseAdmin
      .from('form_configs')
      .update({ is_active: false })
      .eq('is_active', true)
      .select('id', { count: 'exact', head: false })

    if (deactivateError) {
      console.error('[Form Config API] Error deactivating old configs:', deactivateError)
      return NextResponse.json({
        error: 'Failed to deactivate old configs',
        details: deactivateError.message
      }, { status: 500 })
    } else {
      console.log(`[Form Config API] Deactivated ${count} old config(s)`)
    }

    // Insert new config and activate it using admin client
    console.log('[Form Config API] Creating new config version:', newVersion)
    const { data: newConfig, error: insertError } = await supabaseAdmin
      .from('form_configs')
      .insert([
        {
          version: newVersion,
          config: config,
          is_active: true,
          created_by: user.id,
          notes: notes || `Version ${newVersion}`
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('[Form Config API] Error saving config:', insertError)
      return NextResponse.json({
        error: 'Failed to save configuration',
        details: insertError.message
      }, { status: 500 })
    }

    console.log('[Form Config API] New form config saved, version:', newVersion)

    // Final safety check: ensure ONLY this config is active (using admin client)
    console.log('[Form Config API] Running safety check: ensuring only one active config...')
    const { error: safetyError, count: safetyCount } = await supabaseAdmin
      .from('form_configs')
      .update({ is_active: false })
      .neq('id', newConfig.id)
      .eq('is_active', true)
      .select('id', { count: 'exact', head: false })

    if (safetyError) {
      console.warn('[Form Config API] Safety check failed:', safetyError)
    } else {
      console.log(`[Form Config API] Safety check passed: deactivated ${safetyCount || 0} duplicate(s)`)
    }

    // Trigger narrative template regeneration by deleting old templates (using admin client)
    const { error: deleteError } = await supabaseAdmin
      .from('narrative_templates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.warn('[Form Config API] Could not delete old templates:', deleteError)
      // Don't fail the request if template deletion fails
    } else {
      console.log('[Form Config API] Old narrative templates deleted, will regenerate on next use')

      // TODO: Future improvement - automatically regenerate templates via AI after form change
      // Instead of just deleting templates, we could:
      // 1. Call narrative-template API to generate new template immediately
      // 2. This ensures first user after form change doesn't wait for generation
      // 3. Admin gets immediate feedback if AI generation fails
      // Example:
      // await fetch('/api/narrative-template', { method: 'POST' })
    }

    return NextResponse.json({
      success: true,
      config: newConfig,
      message: `Form configuration saved as version ${newVersion}. Narrative templates will regenerate automatically.`
    })
  } catch (error) {
    console.error('[Form Config API] Unexpected error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}
