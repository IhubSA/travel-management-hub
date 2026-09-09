import React from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/hooks/useRole'

function DashboardContent() {
  const { profile } = useAuth()
  const { role } = useRole()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {profile?.first_name || 'User'}
          </h1>
          <p className="mt-2 text-gray-600">
            Role: <span className="font-semibold">{role || 'Loading...'}</span>
          </p>
        </div>

        {/* Placeholder Content */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Travel Requests</h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage and track your travel requests
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Budget Status</h2>
            <p className="mt-2 text-sm text-gray-600">
              View project budget allocation and usage
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Approvals</h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage pending approvals and reviews
            </p>
          </div>
        </div>

        {/* Role-specific content info */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            Role-specific dashboards and components will be displayed based on your user role (STAFF, HOD, TRAVEL_OFFICER, FINANCE, CEO, or SUPER_ADMIN)
          </p>
        </div>
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
