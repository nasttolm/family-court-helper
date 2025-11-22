'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { loadFormConfig } from '@/lib/form/formStorage'
import { generateDynamicDocument } from '@/lib/docx/dynamicDocxGenerator'
import { Packer } from 'docx'
import { saveAs } from 'file-saver'
import { useAuth } from '@/hooks/useAuth'

export default function PreviewPage({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { user, isLoading: authLoading } = useAuth()
  const [formConfig, setFormConfig] = useState(null)
  const [application, setApplication] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !user) return

    // Load application
    const apps = JSON.parse(localStorage.getItem('applications') || '[]')
    const app = apps.find(a => a.id === resolvedParams.id)

    if (!app) {
      alert('Application not found')
      router.push('/dashboard')
      return
    }

    setApplication(app)

    // Load form config
    const config = loadFormConfig()
    setFormConfig(config)
    setIsLoading(false)
  }, [resolvedParams.id, router, user, authLoading])

  const handleEdit = () => {
    // Save current data as draft
    if (application) {
      localStorage.setItem('application_draft', JSON.stringify(application.dynamic_data))
      router.push('/application/new')
    }
  }

  const handleGenerateDocument = async () => {
    try {
      // Generate DOCX document
      const doc = generateDynamicDocument(resolvedParams.id)

      // Convert to blob
      const blob = await Packer.toBlob(doc)

      // Download file
      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `court_application_${timestamp}.docx`
      saveAs(blob, filename)
    } catch (error) {
      console.error('Error generating document:', error)
      alert('Error generating document. Please try again.')
    }
  }

  // Format value based on element type
  const formatValue = (element, value, panelData = null) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-gray-400 italic">Not provided</span>
    }

    // Get value from panel data if it's a nested field
    const actualValue = panelData ? panelData[element.name] : value

    switch (element.type) {
      case 'boolean':
        return actualValue ? 'Yes' : 'No'

      case 'checkbox':
        if (Array.isArray(actualValue) && actualValue.length > 0) {
          return actualValue.join(', ')
        }
        return <span className="text-gray-400 italic">None selected</span>

      case 'text':
        if (element.inputType === 'date' && actualValue) {
          try {
            const date = new Date(actualValue)
            return date.toLocaleDateString('en-GB')
          } catch {
            return actualValue
          }
        }
        return actualValue

      case 'radiogroup':
      case 'dropdown':
        return actualValue

      case 'comment':
        return <div className="whitespace-pre-wrap">{actualValue}</div>

      default:
        return String(actualValue)
    }
  }

  // Render element value
  const renderElement = (element, data, panelData = null) => {
    const value = panelData ? panelData[element.name] : data[element.name]

    // Skip if no value (same as DOCX)
    if (value === undefined || value === null || value === '') {
      return null
    }

    // Check visibility conditions
    if (element.visibleIf) {
      // Simple visibleIf parsing (handles basic cases like {fieldName} = true)
      const match = element.visibleIf.match(/\{(.+?)\}\s*=\s*(.+)/)
      if (match) {
        const [, fieldName, expectedValue] = match
        const actualFieldValue = panelData ? panelData[fieldName] : data[fieldName]
        const expected = expectedValue.trim() === 'true' ? true : expectedValue.trim() === 'false' ? false : expectedValue.trim().replace(/['"]/g, '')

        if (actualFieldValue !== expected) {
          return null // Don't show this field
        }
      }
    }

    return (
      <div key={element.name} className="mb-4">
        <dt className="text-sm font-semibold text-gray-700 mb-1">
          {element.title}
        </dt>
        <dd className="text-sm text-gray-900 pl-4">
          {formatValue(element, value, panelData)}
        </dd>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Application Preview</h1>
          <p className="text-gray-600 mt-2">
            Review your answers below. You can edit or download your application.
          </p>

          {/* Application Info */}
          {application && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>{' '}
                  <span className="font-semibold text-green-600">Completed</span>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>{' '}
                  <span className="font-semibold">
                    {new Date(application.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Application ID:</span>{' '}
                  <span className="font-mono text-xs">{application.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Expires:</span>{' '}
                  <span className="font-semibold">
                    {new Date(application.expiresAt).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Document Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Document Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-8 py-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {formConfig?.title || 'Application Form'}
            </h2>
          </div>

          {/* Document Content */}
          <div className="px-8 py-6 space-y-8">
            {formConfig?.pages?.map((page, pageIndex) => {
              // Check if page has any filled fields
              const hasData = page.elements?.some((element) => {
                if (element.type === 'paneldynamic') {
                  const panels = application?.dynamic_data[element.name] || []
                  return panels.length > 0
                }
                const value = application?.dynamic_data[element.name]
                return value !== undefined && value !== null && value !== ''
              })

              return (
                <div key={page.name || pageIndex}>
                  {/* Page Title */}
                  <div className="border-b-2 border-gray-900 pb-2 mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{page.title}</h3>
                  </div>

                  {/* Page Elements */}
                  {hasData ? (
                    <dl className="space-y-4">
                      {page.elements?.map((element) => {
                    // Handle paneldynamic (repeating sections like children)
                    if (element.type === 'paneldynamic') {
                      const panels = application?.dynamic_data[element.name] || []

                      return (
                        <div key={element.name} className="mb-6">
                          <dt className="text-base font-semibold text-gray-900 mb-3">
                            {element.title}
                          </dt>
                          <dd className="pl-4 space-y-6">
                            {panels.length > 0 ? (
                              panels.map((panelData, panelIndex) => (
                                <div key={panelIndex} className="border-l-2 border-gray-300 pl-4">
                                  <div className="text-sm font-semibold text-gray-700 mb-3">
                                    Item {panelIndex + 1}
                                  </div>
                                  <dl className="space-y-3">
                                    {element.templateElements?.map((templateElement) =>
                                      renderElement(templateElement, application.dynamic_data, panelData)
                                    )}
                                  </dl>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 italic text-sm">No items added</span>
                            )}
                          </dd>
                        </div>
                      )
                    }

                    // Regular elements
                    return renderElement(element, application?.dynamic_data || {})
                  })}
                </dl>
              ) : (
                <p className="text-gray-500 italic">
                  Information not provided
                </p>
              )}
            </div>
          )
        })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Application
          </Button>
          <Button onClick={handleGenerateDocument}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Generate Document
          </Button>
        </div>
      </div>
    </div>
  )
}
