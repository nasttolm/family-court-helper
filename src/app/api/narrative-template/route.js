import { NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'
import { createClient } from '@/lib/supabase/server'
import { loadFormConfigServer } from '@/lib/form/formConfigServer'
import crypto from 'crypto'

// Initialize Hugging Face client (works without API key, but with limits)
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

// GET /api/narrative-template - Health check endpoint
export async function GET(request) {
  console.log('[Narrative Template] GET - Health check called')

  return NextResponse.json({
    status: 'ok',
    templateType: 'ai-with-fallback',
    aiProvider: 'Hugging Face (Free)',
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY ? 'configured (higher rate limits)' : 'not configured (public API, strict limits)',
    supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    serviceRoleConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    timestamp: new Date().toISOString()
  })
}

// POST /api/narrative-template - Generate or retrieve narrative template
// TODO: Future improvement - this could be called automatically when admin saves form
// Currently: templates deleted on form change, regenerated on first user access (lazy loading)
// Future: auto-regenerate immediately after form change (proactive loading)
// Benefits: first user doesn't wait, admin gets instant AI feedback
export async function POST(request) {
  console.log('[Narrative Template] ========== API CALLED ==========')

  try {
    console.log('[Narrative Template] Creating Supabase client...')
    const supabase = await createClient()

    // Check authentication
    console.log('[Narrative Template] Checking authentication...')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('[Narrative Template] Authentication error:', authError?.message || 'No user')
      return NextResponse.json({
        error: 'Unauthorized',
        details: authError?.message || 'User not authenticated'
      }, { status: 401 })
    }

    console.log('[Narrative Template] User authenticated:', user.id)

    // Create Service Role client for database operations (bypass RLS)
    console.log('[Narrative Template] Creating admin client for DB operations...')
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

    // Load form configuration from database (server-side)
    const formConfig = await loadFormConfigServer()
    console.log('[Narrative Template] Form config loaded, pages count:', formConfig?.pages?.length || 0)

    if (!formConfig || !formConfig.pages || formConfig.pages.length === 0) {
      console.error('[Narrative Template] Form config is empty or invalid!')
      return NextResponse.json({
        error: 'Form configuration is empty',
        details: 'Please ensure form_configs table has an active configuration'
      }, { status: 500 })
    }

    // Generate hash of form config to check if template exists
    const configHash = generateFormConfigHash(formConfig)
    console.log('[Narrative Template] Current form config hash:', configHash)

    // Check if template already exists (using admin client)
    const { data: existingTemplate } = await supabaseAdmin
      .from('narrative_templates')
      .select('*')
      .eq('form_config_hash', configHash)
      .single()

    if (existingTemplate) {
      console.log('[Narrative Template] Using cached template (hash match)')
      return NextResponse.json({
        template: existingTemplate,
        cached: true,
        message: 'Template retrieved from cache',
        configHash: configHash
      })
    }

    console.log('[Narrative Template] No cached template found, generating new one')

    // Generate new template (AI with fallback)
    console.log('[Narrative Template] Generating new template...')

    const templateSections = await generateTemplateWithAI(formConfig)
    console.log('[Narrative Template] Template generated successfully')

    // Save to database (using admin client to bypass RLS)
    console.log('[Narrative Template] Saving template to database...')
    const { data: newTemplate, error: insertError } = await supabaseAdmin
      .from('narrative_templates')
      .insert([
        {
          form_config_hash: configHash,
          template_sections: templateSections,
        },
      ])
      .select()
      .single()

    if (insertError) {
      // Handle race condition: if another request already saved this hash
      if (insertError.code === '23505') {
        console.log('[Narrative Template] Template already exists (race condition), fetching from DB...')

        const { data: existingTemplate, error: fetchError } = await supabaseAdmin
          .from('narrative_templates')
          .select('*')
          .eq('form_config_hash', configHash)
          .single()

        if (fetchError || !existingTemplate) {
          console.error('[Narrative Template] Failed to fetch existing template:', fetchError)
          return NextResponse.json({
            error: 'Failed to retrieve template after race condition',
            details: fetchError?.message
          }, { status: 500 })
        }

        console.log('[Narrative Template] Using template created by parallel request')
        return NextResponse.json({
          template: existingTemplate,
          cached: true,
          message: 'Template retrieved from cache (created by parallel request)',
          configHash: configHash
        })
      }

      // Other errors
      console.error('[Narrative Template] Error saving template:', insertError)
      console.error('[Narrative Template] Insert error details:', insertError.details)
      console.error('[Narrative Template] Insert error hint:', insertError.hint)
      return NextResponse.json({
        error: 'Failed to save template to database',
        details: insertError.message
      }, { status: 500 })
    }

    console.log('[Narrative Template] New template generated and saved with hash:', configHash)

    return NextResponse.json({
      template: newTemplate,
      cached: false,
      message: 'New template generated',
      configHash: configHash
    })
  } catch (error) {
    console.error('[Narrative Template] ========== UNEXPECTED ERROR ==========')
    console.error('[Narrative Template] Error message:', error.message)
    console.error('[Narrative Template] Error stack:', error.stack)
    console.error('[Narrative Template] Error full:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}

// DELETE /api/narrative-template - Force regenerate template
export async function DELETE(request) {
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

    // Create admin client to bypass RLS
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

    // Delete all existing templates (force regeneration) using admin client
    const { error: deleteError } = await supabaseAdmin
      .from('narrative_templates')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.error('[Narrative Template] Error deleting templates:', deleteError)
      return NextResponse.json({ error: 'Failed to delete templates' }, { status: 500 })
    }

    return NextResponse.json({ message: 'All templates deleted. Next generation will create new ones.' })
  } catch (error) {
    console.error('[Narrative Template] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Generate hash of form configuration
 */
function generateFormConfigHash(formConfig) {
  // Extract only structure (no descriptions, help text)
  const structure = {
    pages: formConfig.pages.map(page => ({
      name: page.name,
      title: page.title,
      elements: page.elements.map(el => ({
        type: el.type,
        name: el.name,
        title: el.title,
        inputType: el.inputType,
        templateElements: el.templateElements?.map(te => ({
          type: te.type,
          name: te.name,
          title: te.title,
          inputType: te.inputType,
        }))
      }))
    }))
  }

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(structure))
    .digest('hex')
}

/**
 * Generate narrative template with AI (Hugging Face)
 * Works WITHOUT API key (public API with strict rate limits)
 * API key recommended for better performance and higher limits
 * Fallback to static template if AI fails
 */
async function generateTemplateWithAI(formConfig) {
  try {
    const hasApiKey = !!process.env.HUGGINGFACE_API_KEY
    console.log(`[Narrative Template] Generating with Hugging Face AI (${hasApiKey ? 'authenticated' : 'public API'})...`)

    // Extract form structure WITHOUT personal data
    const formStructure = extractFormStructure(formConfig)

    const prompt = `You are a UK legal document writer. Generate narrative text templates for a child custody court application.

FORM STRUCTURE (NO PERSONAL DATA):
${JSON.stringify(formStructure, null, 2)}

REQUIREMENTS:
1. Write in first person ("I am...", "We have...", "I propose...")
2. Use placeholders like {{fieldName}} for all data fields
3. Create flowing paragraphs, NOT question-answer format
4. Use professional, formal legal tone
5. Follow UK court document conventions

Generate templates for these sections:

APPLICANT SECTION - Use these exact field names:
- {{applicantName}}, {{applicantDOB}}, {{applicantAddress}}, {{applicantPhone}}, {{applicantEmail}}

RESPONDENT SECTION - Use these exact field names for OTHER PARENT:
- {{otherParentName}}, {{otherParentAddress}}, {{otherParentPhone}}, {{otherParentEmail}}

CHILDREN SECTION - Use these exact field names:
- {{childCount}}, {{childOrChildren}} (automatically: "child" or "children"), {{childrenList}}, {{childrenDetails}}
- childrenDetails includes: school, SEND (special educational needs), health issues

CURRENT SITUATION - Use these exact field names:
- {{childOrChildren}}, {{currentLivingArrangementText}} (auto-formatted with proper verb), {{currentArrangementDetails}}, {{socialCareStatement}} (auto-formatted)

PROPOSED ARRANGEMENTS - Use these exact field names:
- {{childOrChildren}}, {{proposedLivingArrangementText}} (auto-formatted with proper verb), {{proposedArrangementDetails}}, {{proposedContactSchedule}}, {{proposedHolidayArrangements}}

SAFETY CONCERNS - Use this computed field:
- {{safetyConcernsStatement}} (automatically formatted from form data)

Return ONLY valid JSON in this format:
{
  "applicant": "template text with {{placeholders}}",
  "respondent": "template text with {{placeholders}}",
  "children": "template text with {{placeholders}}",
  "currentSituation": "template text with {{placeholders}}",
  "proposed": "template text with {{placeholders}}",
  "safety": "{{safetyConcernsStatement}}"
}

CRITICAL: Use ONLY the field names listed above. Do NOT invent field names. For example:
- Use {{otherParentName}} NOT {{respondentName}}
- Use {{currentArrangementDetails}} NOT {{currentArrangements}}
- Use {{proposedArrangementDetails}} NOT {{proposedArrangements}}
- Use {{currentLivingArrangementText}} NOT {{currentLivingArrangement}} (the Text version includes proper grammar)`

    // AI models removed - using static template for now
    // Will add Phi-3-mini after verification
    console.log('[Narrative Template] AI generation disabled, using static template')
    return generateStaticTemplate(formConfig)

  } catch (error) {
    console.error('[Narrative Template] ❌ AI generation failed:', error.message)
    console.error('[Narrative Template] Error details:', error)

    // If rate limited, suggest getting API key
    if (error.message.includes('rate') || error.message.includes('limit')) {
      console.error('[Narrative Template] 💡 Tip: Get a free API key at https://huggingface.co/settings/tokens for higher rate limits')
    }

    // FALLBACK TO STATIC TEMPLATE
    console.log('[Narrative Template] Using static fallback template')
    return generateStaticTemplate(formConfig)
  }
}

/**
 * Static narrative template (fallback)
 * Professional UK legal document style
 */
function generateStaticTemplate(formConfig) {
  return {
    applicant: "I, {{applicantName}}, am the applicant in this matter. My date of birth is {{applicantDOB}}. I reside at {{applicantAddress}}. I can be contacted by telephone at {{applicantPhone}} or by email at {{applicantEmail}}.",

    respondent: "The respondent in this matter is {{otherParentName}}, who resides at {{otherParentAddress}}. The respondent can be contacted by telephone at {{otherParentPhone}} or by email at {{otherParentEmail}}.",

    children: "This application concerns {{childCount}} {{childOrChildren}}: {{childrenList}}. {{childrenDetails}}",

    currentSituation: "The {{childOrChildren}} currently {{currentLivingArrangementText}}. {{currentArrangementDetails}} {{socialCareStatement}}",

    proposed: "I propose that the {{childOrChildren}} should {{proposedLivingArrangementText}}. {{proposedArrangementDetails}} Regarding contact with the other parent: {{proposedContactSchedule}} For holidays and special occasions: {{proposedHolidayArrangements}}",

    safety: "{{safetyConcernsStatement}}"
  }
}

/**
 * Extract form structure (field names and types only)
 */
function extractFormStructure(formConfig) {
  return {
    pages: formConfig.pages.map(page => ({
      name: page.name,
      title: page.title,
      elements: page.elements.map(element => ({
        type: element.type,
        name: element.name,
        title: element.title,
        inputType: element.inputType,
        choices: element.choices,
        templateElements: element.templateElements?.map(te => ({
          type: te.type,
          name: te.name,
          title: te.title,
          inputType: te.inputType,
          visibleIf: te.visibleIf
        }))
      }))
    }))
  }
}
