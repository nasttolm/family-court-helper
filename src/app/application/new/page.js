'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import { Button } from '@/components/ui/button'
import { loadFormConfig } from '@/lib/form/formStorage'

import 'survey-core/survey-core.min.css'

export default function NewApplicationPage() {
  const router = useRouter()
  const [survey, setSurvey] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated')
    if (isAuthenticated !== 'true') {
      router.push('/login')
      return
    }

    // Load form config
    const config = loadFormConfig()
    const surveyModel = new Model(config)

    // Load saved draft
    const draft = localStorage.getItem('application_draft')
    if (draft) {
      try {
        surveyModel.data = JSON.parse(draft)
      } catch (error) {
        console.error('Error loading draft:', error)
      }
    }

    // Auto-save on value change
    surveyModel.onValueChanged.add((sender) => {
      localStorage.setItem('application_draft', JSON.stringify(sender.data))
    })

    // Handle completion
    surveyModel.onComplete.add((sender) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const application = {
        id: `app-${Date.now()}`,
        user_id: user.id || '1',
        dynamic_data: sender.data,
        status: 'completed',
        progress: 100,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }

      // Save to applications
      const existingApps = JSON.parse(localStorage.getItem('applications') || '[]')
      existingApps.push(application)
      localStorage.setItem('applications', JSON.stringify(existingApps))

      // Clear draft
      localStorage.removeItem('application_draft')

      // Redirect to preview
      router.push(`/application/preview/${application.id}`)
    })

    setSurvey(surveyModel)
    setIsLoading(false)
  }, [router])

  const handleSaveAndExit = () => {
    if (survey && survey.data) {
      localStorage.setItem('application_draft', JSON.stringify(survey.data))
      alert('Your progress has been saved. You can continue later.')
      router.push('/dashboard')
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
