import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/applications/[id] - Get single application
export async function GET(request, { params }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch application (RLS ensures user can only access their own)
    const { data: application, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      }
      console.error('[API] Error fetching application:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ application })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/applications/[id] - Update application
export async function PATCH(request, { params }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('[API] PATCH /api/applications - User:', user ? user.email : 'null')
    console.log('[API] Application ID:', id)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { dynamic_data, status, progress } = body

    console.log('[API] Update data:', {
      has_dynamic_data: !!dynamic_data,
      status,
      progress
    })

    // Build update object (only update provided fields)
    const updates = {}
    if (dynamic_data !== undefined) updates.dynamic_data = dynamic_data
    if (status !== undefined) updates.status = status
    if (progress !== undefined) updates.progress = progress

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    console.log('[API] Updating application with:', Object.keys(updates))

    // Update application (RLS ensures user can only update their own)
    const { data: application, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('[API] Application not found')
        return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      }
      console.error('[API] Error updating application:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[API] Application updated successfully:', application.id)

    // Log update in audit_log
    await supabase.from('audit_log').insert([
      {
        user_id: user.id,
        action: 'updated',
        resource_type: 'application',
        resource_id: id,
        metadata: updates,
      },
    ])

    return NextResponse.json({ application })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/applications/[id] - Delete application
export async function DELETE(request, { params }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete application (RLS ensures user can only delete their own)
    const { error } = await supabase.from('applications').delete().eq('id', id)

    if (error) {
      console.error('[API] Error deleting application:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log deletion in audit_log
    await supabase.from('audit_log').insert([
      {
        user_id: user.id,
        action: 'deleted',
        resource_type: 'application',
        resource_id: id,
      },
    ])

    return NextResponse.json({ message: 'Application deleted successfully' })
  } catch (error) {
    console.error('[API] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
