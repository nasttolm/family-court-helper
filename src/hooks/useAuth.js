'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth(requireAuth = true) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated')
      const userData = localStorage.getItem('user')

      if (authStatus === 'true' && userData) {
        setIsAuthenticated(true)
        setUser(JSON.parse(userData))
      } else {
        setIsAuthenticated(false)
        setUser(null)

        if (requireAuth) {
          router.push('/login')
        }
      }

      setIsLoading(false)
    }

    checkAuth()

    // Listen for auth changes
    window.addEventListener('authChange', checkAuth)

    return () => {
      window.removeEventListener('authChange', checkAuth)
    }
  }, [router, requireAuth])

  return { isAuthenticated, user, isLoading }
}
