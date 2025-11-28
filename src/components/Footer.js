import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t mt-auto bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Disclaimer */}
        <div className="text-center mb-6 pb-6 border-b border-gray-200">
          <p className="text-sm text-gray-600 max-w-3xl mx-auto">
            <strong>Not Legal Advice:</strong> This service provides a tool to organize information only.
            It does not replace professional legal consultation. Always seek advice from a qualified solicitor.
          </p>
        </div>

        {/* Footer links */}
        <div className="flex flex-col items-center space-y-4">
          {/* Links */}
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-600 hover:text-gray-900">
              Terms of Service
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-600">
            &copy; {currentYear} Family Court Helper. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
