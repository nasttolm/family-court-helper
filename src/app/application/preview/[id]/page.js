'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { loadFormConfig } from '@/lib/form/formStorage'
import { generateDynamicDocument } from '@/lib/docx/dynamicDocxGenerator'
import { generateNarrativeDocument } from '@/lib/docx/narrativeDocxGenerator'
import { generateNarrativeSections } from '@/lib/docx/narrativeTemplateEngine'
import { Packer } from 'docx'
import { saveAs } from 'file-saver'
import { useAuth } from '@/hooks/useAuth'
import ConsentModal from '@/components/modals/ConsentModal'

export default function PreviewPage({ params }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const { user, isLoading: authLoading } = useAuth()
  const [formConfig, setFormConfig] = useState(null)
  const [application, setApplication] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [documentFormat, setDocumentFormat] = useState('narrative') // 'narrative' or 'qa'
  const [narrativeTemplate, setNarrativeTemplate] = useState(null)
  const [narrativeSections, setNarrativeSections] = useState(null)
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false)
  const [templateError, setTemplateError] = useState(null)

  useEffect(() => {
    if (authLoading || !user) return

    // Fetch application from Supabase
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applications/${resolvedParams.id}`)
        const data = await response.json()

        if (response.ok) {
          setApplication(data.application)

          // Load form config from API
          const configResponse = await fetch('/api/form-config')
          const configData = await configResponse.json()
          setFormConfig(configData.config)
        } else {
          console.error('[Preview] Error fetching application:', data.error)
          alert('Application not found')
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('[Preview] Unexpected error:', error)
        alert('Error loading application')
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplication()
  }, [resolvedParams.id, router, user, authLoading])

  // Load narrative template and generate preview when format is narrative
  useEffect(() => {
    if (!application || documentFormat !== 'narrative') {
      setNarrativeSections(null)
      setTemplateError(null)
      return
    }

    const loadNarrativePreview = async () => {
      setIsLoadingTemplate(true)
      setTemplateError(null)
      try {
        // Load template if not cached
        if (!narrativeTemplate) {
          const response = await fetch('/api/narrative-template', {
            method: 'POST'
          })

          if (!response.ok) {
            let errorData
            try {
              errorData = await response.json()
            } catch (e) {
              console.error('Failed to parse error response:', e)
              errorData = { error: `Server error (${response.status})` }
            }
            console.error('Failed to load narrative template:', {
              status: response.status,
              statusText: response.statusText,
              errorData
            })
            setTemplateError(errorData.error || `Server error (${response.status}): ${response.statusText}`)
            return
          }

          const data = await response.json()
          console.log('[Preview] Template loaded:', data.cached ? 'from cache' : 'newly generated', 'Hash:', data.configHash)
          setNarrativeTemplate(data.template)

          // Generate narrative sections for preview
          const sections = generateNarrativeSections(data.template, application.dynamic_data)
          setNarrativeSections(sections)
        } else {
          // Use cached template
          const sections = generateNarrativeSections(narrativeTemplate, application.dynamic_data)
          setNarrativeSections(sections)
        }
      } catch (error) {
        console.error('Error loading narrative preview:', error)
        setTemplateError(error.message || 'An unexpected error occurred')
      } finally {
        setIsLoadingTemplate(false)
      }
    }

    loadNarrativePreview()
  }, [application, documentFormat, narrativeTemplate])

  const handleEdit = () => {
    // Redirect to edit page
    router.push(`/application/edit/${resolvedParams.id}`)
  }

  const handleGenerateDocument = () => {
    // Show consent modal first
    setShowConsentModal(true)
  }

  const handleConsentConfirm = async () => {
    setShowConsentModal(false)

    try {
      let doc

      if (documentFormat === 'narrative') {
        // Load narrative template if not already loaded
        if (!narrativeTemplate) {
          setIsLoadingTemplate(true)
          const templateResponse = await fetch('/api/narrative-template', {
            method: 'POST'
          })

          if (!templateResponse.ok) {
            let errorData
            try {
              errorData = await templateResponse.json()
            } catch (e) {
              errorData = { error: `Server error (${templateResponse.status})` }
            }
            console.error('Failed to load narrative template for download:', errorData)
            throw new Error(errorData.error || 'Failed to load narrative template')
          }

          const templateData = await templateResponse.json()
          console.log('[Preview] Template loaded for download:', templateData.cached ? 'from cache' : 'newly generated')
          setNarrativeTemplate(templateData.template)
          setIsLoadingTemplate(false)

          // Generate narrative document
          doc = generateNarrativeDocument(application, templateData.template)
        } else {
          // Use cached template
          doc = generateNarrativeDocument(application, narrativeTemplate)
        }
      } else {
        // Generate Q&A format document
        doc = generateDynamicDocument(application)
      }

      // Convert to blob
      const blob = await Packer.toBlob(doc)

      // Download file
      const timestamp = new Date().toISOString().split('T')[0]
      const formatSuffix = documentFormat === 'narrative' ? 'narrative' : 'qa'
      const filename = `court_application_${formatSuffix}_${timestamp}.docx`
      saveAs(blob, filename)
    } catch (error) {
      console.error('Error generating document:', error)
      alert('Error generating document. Please try again.')
      setIsLoadingTemplate(false)
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
                    {new Date(application.created_at).toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Application ID:</span>{' '}
                  <span className="font-mono text-xs">{application.id}</span>
                </div>
                <div>
                  <span className="text-gray-600">Expires:</span>{' '}
                  <span className="font-semibold">
                    {new Date(application.expires_at).toLocaleDateString('en-GB')}
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
            {templateError ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-300 rounded-lg p-6 max-w-2xl mx-auto">
                  <svg className="w-12 h-12 text-red-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">Narrative Preview Unavailable</h3>
                  <p className="text-red-700 mb-4">{templateError}</p>
                  <p className="text-sm text-red-600">You can still download in Q&A format below, or contact support if this persists.</p>
                </div>
              </div>
            ) : isLoadingTemplate ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading narrative preview...</p>
                <p className="text-gray-500 text-sm mt-2">This may take 5-10 seconds on first use</p>
              </div>
            ) : documentFormat === 'narrative' && narrativeSections ? (
              /* Narrative Preview */
              <div className="space-y-8">
                {narrativeSections.applicant && (
                  <div>
                    <div className="border-b-2 border-gray-900 pb-2 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">APPLICANT INFORMATION</h3>
                    </div>
                    <p className="text-gray-900 leading-relaxed">{narrativeSections.applicant}</p>
                  </div>
                )}

                {narrativeSections.respondent && (
                  <div>
                    <div className="border-b-2 border-gray-900 pb-2 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">RESPONDENT INFORMATION</h3>
                    </div>
                    <p className="text-gray-900 leading-relaxed">{narrativeSections.respondent}</p>
                  </div>
                )}

                {narrativeSections.children && (
                  <div>
                    <div className="border-b-2 border-gray-900 pb-2 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">CHILDREN</h3>
                    </div>
                    {narrativeSections.children.split('\n\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} className="text-gray-900 leading-relaxed mb-4">{paragraph.trim()}</p>
                      )
                    ))}
                  </div>
                )}

                {narrativeSections.currentSituation && (
                  <div>
                    <div className="border-b-2 border-gray-900 pb-2 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">CURRENT LIVING ARRANGEMENTS</h3>
                    </div>
                    {narrativeSections.currentSituation.split('\n\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} className="text-gray-900 leading-relaxed mb-4">{paragraph.trim()}</p>
                      )
                    ))}
                  </div>
                )}

                {narrativeSections.proposed && (
                  <div>
                    <div className="border-b-2 border-gray-900 pb-2 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">PROPOSED ARRANGEMENTS</h3>
                    </div>
                    {narrativeSections.proposed.split('\n\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} className="text-gray-900 leading-relaxed mb-4">{paragraph.trim()}</p>
                      )
                    ))}
                  </div>
                )}

                {narrativeSections.safety && (
                  <div>
                    <div className="border-b-2 border-gray-900 pb-2 mb-4">
                      <h3 className="text-xl font-bold text-gray-900">SAFETY CONCERNS</h3>
                    </div>
                    {narrativeSections.safety.split('\n\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} className="text-gray-900 leading-relaxed mb-4">{paragraph.trim()}</p>
                      )
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Q&A Preview */
              formConfig?.pages?.map((page, pageIndex) => {
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
          })
            )}
          </div>
        </div>

        {/* Document Format Selection */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
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
        <div className="flex flex-wrap gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Application
          </Button>
          <Button onClick={handleGenerateDocument} disabled={isLoadingTemplate}>
            {isLoadingTemplate ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Loading Template...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Generate Document
              </>
            )}
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
    </div>
  )
}
