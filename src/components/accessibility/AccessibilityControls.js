'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AccessibilityControls() {
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState('medium')
  const [highContrast, setHighContrast] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('accessibility_fontSize')
    const savedHighContrast = localStorage.getItem('accessibility_highContrast')

    if (savedFontSize) {
      setFontSize(savedFontSize)
      applyFontSize(savedFontSize)
    }

    if (savedHighContrast === 'true') {
      setHighContrast(true)
      applyHighContrast(true)
    }
  }, [])

  // Apply font size to document
  const applyFontSize = (size) => {
    const root = document.documentElement
    root.classList.remove('text-small', 'text-medium', 'text-large')
    root.classList.add(`text-${size}`)
  }

  // Apply high contrast to document
  const applyHighContrast = (enabled) => {
    const root = document.documentElement
    if (enabled) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
  }

  // Handle font size change
  const handleFontSizeChange = (size) => {
    setFontSize(size)
    applyFontSize(size)
    localStorage.setItem('accessibility_fontSize', size)
  }

  // Handle high contrast toggle
  const handleHighContrastToggle = () => {
    const newValue = !highContrast
    setHighContrast(newValue)
    applyHighContrast(newValue)
    localStorage.setItem('accessibility_highContrast', newValue.toString())
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
        aria-label="Accessibility settings"
        title="Accessibility settings"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 11h2m-1 -1v2"
          />
        </svg>
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Accessibility Settings
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Font Size Control */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Text Size
            </label>
            <div className="flex gap-2">
              <Button
                variant={fontSize === 'small' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFontSizeChange('small')}
                className="flex-1"
              >
                A-
              </Button>
              <Button
                variant={fontSize === 'medium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFontSizeChange('medium')}
                className="flex-1"
              >
                A
              </Button>
              <Button
                variant={fontSize === 'large' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFontSizeChange('large')}
                className="flex-1"
              >
                A+
              </Button>
            </div>
          </div>

          {/* High Contrast Toggle */}
          <div>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm font-medium text-gray-700">
                High Contrast Mode
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={handleHighContrastToggle}
                  className="sr-only"
                  aria-label="Toggle high contrast mode"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    highContrast ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      highContrast ? 'translate-x-6' : 'translate-x-0.5'
                    } mt-0.5`}
                  ></div>
                </div>
              </div>
            </label>
          </div>

          {/* Help Text */}
          <p className="mt-4 text-xs text-gray-500">
            These settings will be saved and applied across all pages.
          </p>
        </div>
      )}
    </>
  )
}
