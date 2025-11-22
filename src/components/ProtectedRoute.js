'use client'

import { useAuth } from '@/hooks/useAuth'

// Note: This component is now redundant as middleware handles route protection
// Keeping it for backward compatibility, but useAuth hook does the redirect
export default function ProtectedRoute({ children }) {
  const { isLoading } = useAuth(true)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
