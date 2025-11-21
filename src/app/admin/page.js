'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getFormVersion } from '@/lib/form/formStorage'

export default function AdminDashboard() {
  const router = useRouter()
  const [formVersion, setFormVersion] = useState(0)

  useEffect(() => {
    // Load form version
    const version = getFormVersion()
    setFormVersion(version)
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your form and view statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Form Builder Card */}
        <Card>
          <CardHeader>
            <CardTitle>Form Builder</CardTitle>
            <CardDescription>Create and edit your application form</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Current Version: <span className="font-semibold">v{formVersion}</span></p>
              </div>
              <Button onClick={() => router.push('/admin/form-builder')} className="w-full">
                Open Form Builder
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Preview Form</CardTitle>
            <CardDescription>See how users will see the form</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Preview the current form configuration as a user would see it.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/application/new')}
                className="w-full"
              >
                Preview as User
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
