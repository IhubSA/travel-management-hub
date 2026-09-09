'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!password || !confirmPassword) {
        throw new Error('Please enter your new password')
      }

      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match')
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password'
      setError(message)
      console.error('Reset password error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <div className="text-4xl">✓</div>
            <h1 className="text-2xl font-bold text-gray-900">Password Reset</h1>
            <p className="text-sm text-gray-600">
              Your password has been successfully reset. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create New Password</h1>
          <p className="text-sm text-gray-600">
            Enter your new password to regain access to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Minimum 8 characters for security
            </p>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-1">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center text-sm">
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
