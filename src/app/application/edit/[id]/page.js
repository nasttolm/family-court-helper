'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import { Button } from '@/components/ui/button'
import { loadFormConfig } from '@/lib/form/formStorage'
import { useAuth } from '@/hooks/useAuth'
import ConsentModal from '@/components/modals/ConsentModal'

import 'survey-core/survey-core.min.css'

export default function EditApplicationPage({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { user, isLoading: authLoading } = useAuth()
  const [survey, setSurvey] = useState(null)
  const [application, setApplication] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState(null)

  useEffect(() => {
    if (authLoading || !user) return

    // Fetch application from API
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${resolvedParams.id}`)
        const data = await response.json()

        if (response.ok) {
          setApplication(data.application)

          // Load form config
          const config = loadFormConfig()
          const surveyModel = new Model(config)

          // Load application data into survey
          surveyModel.data = data.application.dynamic_data || {}

          // Auto-save on value change
          surveyModel.onValueChanged.add((sender) => {
            localStorage.setItem('application_edit_draft', JSON.stringify(sender.data))
          })

          // Handle completion - show consent modal first
          surveyModel.onComplete.add(async (sender) => {
            setPendingFormData(sender.data)
            setShowConsentModal(true)
          })

          setSurvey(surveyModel)
        } else {
          console.error('[Application] Error fetching:', data.error)
          alert('Application not found')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('[Application] Unexpected error:', error)
        alert('Error loading application')
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplication()
  }, [resolvedParams.id, router, user, authLoading])

  const handleConsentConfirm = async () => {
    setShowConsentModal(false)

    try {
      // Update application via API
      const updateResponse = await fetch(`/api/applications/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dynamic_data: pendingFormData,
          status: 'completed',
          progress: 100,
        }),
      })

      const updateData = await updateResponse.json()

      if (updateResponse.ok) {
        // Clear edit draft
        localStorage.removeItem('application_edit_draft')

        // Redirect to preview
        router.push(`/application/preview/${resolvedParams.id}`)
      } else {
        console.error('[Application] Error updating:', updateData.error)
        alert('Error updating application. Please try again.')
      }
    } catch (error) {
      console.error('[Application] Unexpected error:', error)
      alert('Error updating application. Please try again.')
    }
  }

  const handleSaveAndExit = async () => {
    if (survey && survey.data) {
      try {
        // Calculate progress based on filled fields
        const allQuestions = survey.getAllQuestions()
        const filledQuestions = allQuestions.filter(q => {
          const value = survey.data[q.name]
          return value !== undefined && value !== null && value !== ''
        })
        const progress = Math.round((filledQuestions.length / allQuestions.length) * 100)

        // Save current progress to Supabase (keep original status)
        const response = await fetch(`/api/applications/${resolvedParams.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dynamic_data: survey.data,
            // Keep original status - don't change it
            status: application.status,
            progress: application.status === 'draft' ? progress : 100,
          }),
        })

        if (response.ok) {
          localStorage.removeItem('application_edit_draft')
          alert('Your changes have been saved.')
          router.push('/dashboard')
        } else {
          alert('Error saving changes. Please try again.')
        }
      } catch (error) {
        console.error('[Application] Error saving:', error)
        alert('Error saving changes. Please try again.')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Application</h1>
          <p className="text-gray-600 mt-2">
            Update your court application details
          </p>

          {/* Application Info */}
          {application && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                Editing application created on {new Date(application.created_at).toLocaleDateString('en-GB')}
              </p>
            </div>
          )}

          {/* Auto-save notice */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              Your changes are automatically saved as you type
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

      {/* Consent Modal (Before Completion) */}
      <ConsentModal
        isOpen={showConsentModal}
        onConfirm={handleConsentConfirm}
        onCancel={() => setShowConsentModal(false)}
      />
    </div>
  )
}
