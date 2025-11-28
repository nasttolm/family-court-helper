'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * Consent Modal - Shows Terms and Privacy Policy agreement before form submission
 * State is managed internally and reset when modal opens/closes
 * @param {boolean} isOpen - Whether modal is visible
 * @param {function} onConfirm - Callback when user agrees (receives no params, just confirms)
 * @param {function} onCancel - Callback when user cancels
 * @param {string} confirmButtonText - Text for confirm button (default: "Agree and Submit")
 * @param {string} title - Modal title (default: "Before You Submit")
 */
export default function ConsentModal({
  isOpen,
  onConfirm,
  onCancel,
  confirmButtonText = 'Agree and Submit',
  title = 'Before You Submit'
}) {
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)

  // Reset checkboxes when modal opens
  useEffect(() => {
    if (isOpen) {
      setAcceptTerms(false)
      setAcceptPrivacy(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (!acceptTerms || !acceptPrivacy) {
      alert('Please accept both Terms of Service and Privacy Policy to continue.')
      return
    }
    onConfirm()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>

        <p className="text-gray-600 mb-6">
          Please confirm that you have read and agree to our terms and policies:
        </p>

        {/* Terms of Service Checkbox */}
        <div className="mb-4">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I accept the{' '}
              <Link
                href="/terms"
                target="_blank"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Terms of Service
              </Link>
            </span>
          </label>
        </div>

        {/* Privacy Policy Checkbox */}
        <div className="mb-6">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I accept the{' '}
              <Link
                href="/privacy"
                target="_blank"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleConfirm}
            disabled={!acceptTerms || !acceptPrivacy}
            className="flex-1"
          >
            {confirmButtonText}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
