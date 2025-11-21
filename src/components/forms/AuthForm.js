'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { loginSchema, registerSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'

export default function AuthForm({ mode = 'login' }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const isLogin = mode === 'login'
  const schema = isLogin ? loginSchema : registerSchema

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      acceptTerms: false,
      acceptPrivacy: false,
    },
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setError('')

    try {
      // Mock authentication - just save to localStorage for now
      // TODO: Replace with real Supabase auth later

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock successful authentication
      const mockUser = {
        id: '1',
        email: data.email,
        [isLogin ? 'loggedInAt' : 'createdAt']: new Date().toISOString(),
      }

      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('isAuthenticated', 'true')

      // Dispatch auth change event
      window.dispatchEvent(new Event('authChange'))

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(`${isLogin ? 'Login' : 'Registration'} failed. Please try again.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="your.email@example.com"
          {...register('email')}
          aria-invalid={errors.email ? 'true' : 'false'}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
          {...register('password')}
          aria-invalid={errors.password ? 'true' : 'false'}
        />
        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
        {!isLogin && (
          <p className="text-xs text-gray-500">
            Must be at least 6 characters with uppercase, lowercase, and number
          </p>
        )}
      </div>

      {/* Confirm Password Field (Register only) */}
      {!isLogin && (
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            {...register('confirmPassword')}
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      )}

      {/* Terms & Privacy Checkboxes (Register only) */}
      {!isLogin && (
        <div className="space-y-4 pt-2">
          {/* Terms of Service */}
          <div className="flex items-start space-x-3">
            <Controller
              name="acceptTerms"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="acceptTerms"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={errors.acceptTerms ? 'true' : 'false'}
                />
              )}
            />
            <div className="flex-1">
              <Label
                htmlFor="acceptTerms"
                className="text-sm font-normal leading-relaxed cursor-pointer"
              >
                I accept the{' '}
                <Link
                  href="/terms"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Terms of Service
                </Link>
              </Label>
              {errors.acceptTerms && (
                <p className="text-sm text-red-600 mt-1">{errors.acceptTerms.message}</p>
              )}
            </div>
          </div>

          {/* Privacy Policy */}
          <div className="flex items-start space-x-3">
            <Controller
              name="acceptPrivacy"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="acceptPrivacy"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={errors.acceptPrivacy ? 'true' : 'false'}
                />
              )}
            />
            <div className="flex-1">
              <Label
                htmlFor="acceptPrivacy"
                className="text-sm font-normal leading-relaxed cursor-pointer"
              >
                I accept the{' '}
                <Link
                  href="/privacy"
                  target="_blank"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Privacy Policy
                </Link>
              </Label>
              {errors.acceptPrivacy && (
                <p className="text-sm text-red-600 mt-1">{errors.acceptPrivacy.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading
          ? (isLogin ? 'Logging in...' : 'Creating Account...')
          : (isLogin ? 'Login' : 'Create Account')
        }
      </Button>

      {/* Info Message */}
      {isLogin ? (
        <p className="text-sm text-gray-600 text-center">
          This is a demo login. Any email/password will work for testing.
        </p>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            This is a demo registration. Your data will be stored locally for testing purposes only.
          </p>
        </div>
      )}
    </form>
  )
}
