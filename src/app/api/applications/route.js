import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/applications - Get all applications for current user
export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('[API] GET /api/applications - User:', user ? user.email : 'null')
    console.log('[API] Auth Error:', authError)

    if (authError || !user) {
      console.log('[API] Returning Unauthorized')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch applications (RLS automatically filters by user_id)
    const { data: applications, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API] Error fetching applications:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/applications - Create new application
export async function POST(request) {
  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { dynamic_data, status = 'draft', progress = 0 } = body

    if (!dynamic_data) {
      return NextResponse.json({ error: 'dynamic_data is required' }, { status: 400 })
    }

    // Create application
    const { data: application, error } = await supabase
      .from('applications')
      .insert([
        {
          user_id: user.id,
          dynamic_data,
          status,
          progress,
          // expires_at is auto-calculated by database (created_at + 7 days)
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('[API] Error creating application:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log creation in audit_log
    await supabase.from('audit_log').insert([
      {
        user_id: user.id,
        action: 'created',
        resource_type: 'application',
        resource_id: application.id,
        metadata: { status, progress },
      },
    ])

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
