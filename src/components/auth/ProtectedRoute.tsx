'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/hooks/useRole'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole | UserRole[]
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const { hasRole } = useRole()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || loading) return

    // Not authenticated - redirect to login
    if (!user) {
      router.push('/login')
      return
    }

    // Check role if required
    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/dashboard')
      return
    }
  }, [user, loading, mounted, requiredRole, hasRole, router])

  // Show fallback while loading or checking auth
  if (!mounted || loading) {
    return fallback || <LoadingPlaceholder />
  }

  // Not authenticated
  if (!user) {
    return null
  }

  // Wrong role
  if (requiredRole && !hasRole(requiredRole)) {
    return null
  }

  return <>{children}</>
}

function LoadingPlaceholder() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="space-y-4 text-center">
        <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="text-sm font-medium text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
