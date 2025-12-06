'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Model } from 'survey-core'
import { Survey } from 'survey-react-ui'
import { Button } from '@/components/ui/button'
import { loadFormConfig } from '@/lib/form/formStorage'
import { generateDynamicDocument } from '@/lib/docx/dynamicDocxGenerator'
import { generateNarrativeDocument } from '@/lib/docx/narrativeDocxGenerator'
import { Packer } from 'docx'
import { saveAs } from 'file-saver'
import Link from 'next/link'
import ConsentModal from '@/components/modals/ConsentModal'

import 'survey-core/survey-core.min.css'

export default function GuestApplicationPage() {
  const router = useRouter()
  const [survey, setSurvey] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [pendingFormData, setPendingFormData] = useState(null)
  const [documentFormat, setDocumentFormat] = useState('narrative')
  const [narrativeTemplate, setNarrativeTemplate] = useState(null)
  const [formConfig, setFormConfig] = useState(null)

  useEffect(() => {
    // Load form config from API
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/form-config')
        const data = await response.json()

        setFormConfig(data.config)
        const surveyModel = new Model(data.config)

        // Check if there's a saved guest draft
        const urlParams = new URLSearchParams(window.location.search)
        const isNewApplication = urlParams.get('new') === 'true'

        if (!isNewApplication) {
          const draft = localStorage.getItem('guest_application_draft')
          if (draft) {
            try {
              surveyModel.data = JSON.parse(draft)
            } catch (error) {
              console.error('Error loading guest draft:', error)
            }
          }
        } else {
          localStorage.removeItem('guest_application_draft')
        }

        // Auto-save on value change (localStorage only)
        surveyModel.onValueChanged.add((sender) => {
          localStorage.setItem('guest_application_draft', JSON.stringify(sender.data))
        })

        // Handle completion - show consent modal first
        surveyModel.onComplete.add(async (sender) => {
          setPendingFormData(sender.data)
          setShowConsentModal(true)
        })

        setSurvey(surveyModel)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading form config:', error)
        setIsLoading(false)
      }
    }

    loadConfig()
  }, [])

  const handleConsentConfirm = async () => {
    setShowConsentModal(false)
    await handleGenerateDocument(pendingFormData)
  }

  const handleGenerateDocument = async (formData) => {
    if (!formData || Object.keys(formData).length === 0) {
      alert('Please fill out the form before generating the document.')
      return
    }

    setIsGenerating(true)

    try {
      // Create application object for document generator
      const guestApplication = {
        dynamic_data: formData,
        created_at: new Date().toISOString(),
      }

      let doc

      if (documentFormat === 'narrative') {
        // Load narrative template if not already loaded
        if (!narrativeTemplate) {
          const templateResponse = await fetch('/api/narrative-template', {
            method: 'POST'
          })

          if (!templateResponse.ok) {
            throw new Error('Failed to load narrative template')
          }

          const templateData = await templateResponse.json()
          console.log('[Guest] Template loaded:', templateData.cached ? 'from cache' : 'newly generated')
          setNarrativeTemplate(templateData.template)

          // Generate narrative document
          doc = generateNarrativeDocument(guestApplication, templateData.template)
        } else {
          // Use cached template
          doc = generateNarrativeDocument(guestApplication, narrativeTemplate)
        }
      } else {
        // Generate Q&A format document
        doc = generateDynamicDocument(guestApplication)
      }

      const blob = await Packer.toBlob(doc)

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0]
      const formatSuffix = documentFormat === 'narrative' ? 'narrative' : 'qa'
      const filename = `Court_Application_${formatSuffix}_${timestamp}.docx`

      // Download
      saveAs(blob, filename)

      // Clear draft
      localStorage.removeItem('guest_application_draft')

      // Show registration prompt
      setShowRegistrationPrompt(true)
    } catch (error) {
      console.error('[Guest] Error generating document:', error)
      alert('Error generating document. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadAgain = async () => {
    if (!survey || !survey.data) return
    await handleGenerateDocument(survey.data)
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
        {/* Guest Mode Banner */}
        <div className="mb-6 bg-amber-50 border border-amber-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">Guest Mode</h3>
              <p className="text-sm text-amber-800 mb-2">
                You are using guest mode. Your progress is saved locally on this device only and will not be stored on our servers.
              </p>
              <Link href="/register">
                <Button variant="outline" size="sm" className="border-amber-600 text-amber-900 hover:bg-amber-100">
                  Register to save for 30 days
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Court Application Form</h1>
          <p className="text-gray-600 mt-2">
            Complete the form and download your document immediately
          </p>

          {/* Auto-save notice */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              Your progress is automatically saved on this device as you type
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {survey && <Survey model={survey} />}
        </div>

        {/* Document Format Selection */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Choose Document Format</h3>
          <div className="space-y-2">
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="documentFormat"
                value="narrative"
                checked={documentFormat === 'narrative'}
                onChange={(e) => setDocumentFormat(e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Narrative Format (Recommended)</div>
                <div className="text-sm text-gray-600">
                  Professional flowing text, easier to read. Generated using AI to create natural paragraphs.
                </div>
              </div>
            </label>
            <label className="flex items-start cursor-pointer">
              <input
                type="radio"
                name="documentFormat"
                value="qa"
                checked={documentFormat === 'qa'}
                onChange={(e) => setDocumentFormat(e.target.value)}
                className="mt-1 mr-3"
              />
              <div>
                <div className="font-medium text-gray-900">Question & Answer Format</div>
                <div className="text-sm text-gray-600">
                  Traditional format with questions and answers listed.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </div>
      </div>

      {/* Consent Modal (Before Download) */}
      <ConsentModal
        isOpen={showConsentModal}
        onConfirm={handleConsentConfirm}
        onCancel={() => setShowConsentModal(false)}
        confirmButtonText="Agree and Download"
        title="Before You Download"
      />

      {/* Registration Prompt Modal */}
      {showRegistrationPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Downloaded!</h2>
              <p className="text-gray-600">
                Your court application document has been downloaded successfully.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Want to save your application?</h3>
              <p className="text-sm text-blue-800 mb-3">
                Register for a free account to:
              </p>
              <ul className="text-sm text-blue-800 space-y-1 mb-3">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Save your progress and return later</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Edit and update your application</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Your data is kept safe for 30 days</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Link href="/register" className="flex-1">
                <Button className="w-full">
                  Create Free Account
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setShowRegistrationPrompt(false)} className="flex-1">
                Maybe Later
              </Button>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={handleDownloadAgain}
                className="text-sm text-blue-600 hover:underline"
                disabled={isGenerating}
              >
                Download again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generating overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 font-medium">
              {documentFormat === 'narrative' && !narrativeTemplate
                ? 'Loading narrative template...'
                : 'Generating your document...'}
            </p>
            {documentFormat === 'narrative' && !narrativeTemplate && (
              <p className="text-gray-500 text-sm mt-2">This may take 5-10 seconds on first use</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
