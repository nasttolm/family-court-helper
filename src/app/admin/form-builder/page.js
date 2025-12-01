'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SurveyCreatorComponent, SurveyCreator } from 'survey-creator-react'
import { Model } from 'survey-core'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  saveFormConfig,
  loadFormConfig,
  getFormVersion,
  exportFormConfig,
  clearFormConfig
} from '@/lib/form/formStorage'

import 'survey-core/survey-core.min.css'
import 'survey-creator-core/survey-creator-core.min.css'

export default function FormBuilderPage() {
  const router = useRouter()
  const [creator, setCreator] = useState(null)
  const [version, setVersion] = useState(0)
  const [saveMessage, setSaveMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Load form config from API
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/form-config')
        const data = await response.json()

        setVersion(data.version || 0)

        // Initialize Survey Creator
        const creatorOptions = {
          showLogicTab: false,
          isAutoSave: false,
          showJSONEditorTab: true,
          showTranslationTab: false,
          showEmbeddedSurveyTab: false
        }

        const surveyCreator = new SurveyCreator(creatorOptions)
        surveyCreator.JSON = data.config
        setCreator(surveyCreator)
      } catch (error) {
        console.error('Error loading form config:', error)
        setSaveMessage('Error loading form configuration')
      }
    }

    loadConfig()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const json = creator.JSON
      console.log('[Form Builder] Saving form config...', { pages: json.pages?.length })

      const response = await fetch('/api/form-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: json,
          notes: `Updated by admin`
        })
      })

      console.log('[Form Builder] Response status:', response.status)
      const data = await response.json()
      console.log('[Form Builder] Response data:', data)

      if (response.ok) {
        setVersion(data.config.version)
        setSaveMessage(data.message || `Form saved successfully! Version ${data.config.version}`)
        setTimeout(() => setSaveMessage(''), 5000)
        console.log('[Form Builder] ✅ Form saved successfully, version:', data.config.version)
      } else {
        console.error('[Form Builder] ❌ Save failed:', data.error)
        setSaveMessage(`Error: ${data.error || 'Failed to save form'}`)
      }
    } catch (error) {
      console.error('[Form Builder] ❌ Unexpected error:', error)
      setSaveMessage(`Error saving form: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset the form to default? This will reload the current active form from the database. To create a new default, edit and save the form.')) {
      try {
        const response = await fetch('/api/form-config')
        const data = await response.json()
        creator.JSON = data.config
        setVersion(data.version)
        setSaveMessage('Form reloaded from database')
        setTimeout(() => setSaveMessage(''), 3000)
      } catch (error) {
        setSaveMessage('Error reloading form')
      }
    }
  }

  const handleExport = () => {
    try {
      const config = creator.JSON
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `form_config_v${version}.json`
      link.click()
      URL.revokeObjectURL(url)
      setSaveMessage('Form exported successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Error exporting form')
    }
  }

  const handleImport = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const importedConfig = JSON.parse(event.target.result)
          creator.JSON = importedConfig
          setSaveMessage('Form imported successfully! Click Save to apply changes.')
        } catch (error) {
          setSaveMessage(`Error importing form: ${error.message}`)
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Form Builder</h1>
            <p className="text-gray-600 mt-2">
              Create and edit your application form using drag-and-drop
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Current Version: <span className="font-semibold">v{version}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Form'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/application/new')}>
              Preview
            </Button>
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className={`mt-4 p-3 rounded-md ${
            saveMessage.includes('Error')
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-green-50 text-green-800 border border-green-200'
          }`}>
            {saveMessage}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mb-6 flex gap-2">
        <Button variant="outline" size="sm" onClick={handleExport}>
          Export JSON
        </Button>
        <label>
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="outline" size="sm" as="span">
            Import JSON
          </Button>
        </label>
        <Button variant="outline" size="sm" onClick={handleReset} className="text-red-600">
          Reset to Default
        </Button>
      </div>

      {/* Form Builder - Full Width */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ minHeight: '600px' }}>
        {creator && <SurveyCreatorComponent creator={creator} />}
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Use Survey Creator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Interface Layout</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li><strong>Left Panel (Toolbox):</strong> Drag components like text, dropdown, checkbox, etc.</li>
                <li><strong>Center Panel (Canvas):</strong> Your form workspace</li>
                <li><strong>Right Panel (Properties):</strong> Edit selected component properties</li>
                <li><strong>Top Tabs:</strong> Switch between Designer, Preview, and JSON Editor</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Building Your Form</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Drag components from Toolbox to Canvas</li>
                <li>Click on a component to edit its properties</li>
                <li><strong>Add New Page:</strong> Drag "Page" from Toolbox or scroll down and click "Add Page" button</li>
                <li><strong>Add Description:</strong> In Properties panel, use "Description" field to add explanatory text under questions</li>
                <li>Set validation rules (required, email, min/max, etc.)</li>
                <li><strong>Conditional Questions:</strong> Use "visibleIf" in Properties to show questions only if previous answer is Yes/No or specific value (e.g., <code className="bg-gray-100 px-1">&#123;hasSafetyConcerns&#125; = true</code>)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Saving & Testing</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Click <strong>Save Form</strong> button to save changes</li>
                <li>Use <strong>Preview</strong> tab (inside Creator) to test form</li>
                <li>Use <strong>Preview</strong> button (top right) to test as real user</li>
                <li><strong>Export JSON</strong> to backup your form</li>
                <li><strong>Import JSON</strong> to restore a previous version</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
