import Link from 'next/link'
import AuthForm from '@/components/forms/AuthForm'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Register - Family Court Helper',
  description: 'Create a free account to start organizing your court application',
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create Your Account
          </h1>
          <p className="mt-2 text-gray-600">
            Start organizing your family court information today
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register for Free</CardTitle>
            <CardDescription>
              Create an account to save your progress and access your applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm mode="register" />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Login here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
