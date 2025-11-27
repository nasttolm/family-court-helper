'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import { Button } from '@/components/ui/button'
import { loadFormConfig } from '@/lib/form/formStorage'
import { useAuth } from '@/hooks/useAuth'

import 'survey-core/survey-core.min.css'

export default function NewApplicationPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [survey, setSurvey] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [draftId, setDraftId] = useState(null)

  useEffect(() => {
    if (authLoading || !user) return

    // Load form config
    const config = loadFormConfig()
    const surveyModel = new Model(config)

    // Check URL params for 'new' parameter to clear draft
    const urlParams = new URLSearchParams(window.location.search)
    const isNewApplication = urlParams.get('new') === 'true'

    // Load saved draft only if not explicitly creating new application
    if (!isNewApplication) {
      const draft = localStorage.getItem('application_draft')
      const savedDraftId = localStorage.getItem('application_draft_id')

      if (draft) {
        try {
          surveyModel.data = JSON.parse(draft)
          if (savedDraftId) {
            setDraftId(savedDraftId)
          }
        } catch (error) {
          console.error('Error loading draft:', error)
        }
      }
    } else {
      // Clear draft if creating new application
      localStorage.removeItem('application_draft')
      localStorage.removeItem('application_draft_id')
    }

    // Auto-save on value change
    surveyModel.onValueChanged.add((sender) => {
      localStorage.setItem('application_draft', JSON.stringify(sender.data))
    })

    // Handle completion
    surveyModel.onComplete.add(async (sender) => {
      try {
        // Save to Supabase via API
        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dynamic_data: sender.data,
            status: 'completed',
            progress: 100,
          }),
        })

        const data = await response.json()

        if (response.ok) {
          // Clear draft after successful save
          localStorage.removeItem('application_draft')
          localStorage.removeItem('application_draft_id')

          // Redirect to preview
          router.push(`/application/preview/${data.application.id}`)
        } else {
          console.error('[Application] Error saving:', data.error)
          alert('Error saving application. Please try again.')
        }
      } catch (error) {
        console.error('[Application] Unexpected error:', error)
        alert('Error saving application. Please try again.')
      }
    })

    setSurvey(surveyModel)
    setIsLoading(false)
  }, [router, user, authLoading])

  const handleSaveAndExit = async () => {
    if (!survey || !survey.data) return

    try {
      // Calculate progress based on filled fields
      const allQuestions = survey.getAllQuestions()
      const filledQuestions = allQuestions.filter(q => {
        const value = survey.data[q.name]
        return value !== undefined && value !== null && value !== ''
      })
      const progress = Math.round((filledQuestions.length / allQuestions.length) * 100)

      // Save to localStorage
      localStorage.setItem('application_draft', JSON.stringify(survey.data))

      // Save to Supabase
      const method = draftId ? 'PATCH' : 'POST'
      const url = draftId ? `/api/applications/${draftId}` : '/api/applications'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dynamic_data: survey.data,
          status: 'draft',
          progress: progress,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const savedId = data.application?.id || draftId
        if (savedId) {
          setDraftId(savedId)
          localStorage.setItem('application_draft_id', savedId)
        }
        alert('Your progress has been saved. You can continue later from your dashboard.')
        router.push('/dashboard')
      } else {
        console.error('[Application] Error saving draft:', data.error)
        alert('Error saving draft. Please try again.')
      }
    } catch (error) {
      console.error('[Application] Unexpected error:', error)
      alert('Error saving draft. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">New Application</h1>
          <p className="text-gray-600 mt-2">
            Complete the form below to create your court application
          </p>

          {/* Auto-save notice */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              Your progress is automatically saved as you type
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {survey && <Survey model={survey} />}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSaveAndExit}>
            Save & Exit
          </Button>
        </div>
      </div>
    </div>
  )
}
