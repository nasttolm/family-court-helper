import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Terms of Service - Family Court Helper',
  description: 'Terms of Service for Family Court Helper application',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            {/* Content will be added here */}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/register">
              <Button variant="outline">Back to Registration</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
