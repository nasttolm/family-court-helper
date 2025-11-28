'use client'

import { usePathname } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ApplicationLayout({ children }) {
  const pathname = usePathname()

  // Guest mode doesn't require authentication
  const isGuestMode = pathname?.startsWith('/application/guest')

  if (isGuestMode) {
    return <>{children}</>
  }

  return <ProtectedRoute>{children}</ProtectedRoute>
}
