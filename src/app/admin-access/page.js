'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function AdminAccessPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Simple password for MVP (will be replaced with real auth later)
  const ADMIN_PASSWORD = 'admin123'

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (password === ADMIN_PASSWORD) {
      // Grant admin access
      localStorage.setItem('isAdmin', 'true')

      // Dispatch auth change event
      window.dispatchEvent(new Event('authChange'))

      // Redirect to admin panel
      router.push('/admin')
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Access</CardTitle>
          <CardDescription>
            Enter admin password to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="password">Admin Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
              {error && (
                <p className="text-sm text-red-600 mt-1">{error}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Access Admin Panel
            </Button>
          </form>

          {/* Development hint */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Development Mode:</strong> Password is <code className="bg-amber-100 px-1 rounded">admin123</code>
            </p>
            <p className="text-xs text-amber-700 mt-2">
              This will be replaced with proper authentication when backend is integrated.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
