'use client'

import React, { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/hooks/useRole'
import { db } from '@/lib/mock-db'
import { initials } from '@/utils/format'

export default function ProfilePage() {
  const { profile } = useAuth()
  const { role } = useRole()

  const departmentName =
    db.departments.find((d) => d.id === profile?.department_id)?.name ?? '—'

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
  })

  // Populate from the signed-in profile, and repopulate when the demo
  // identity is switched in the header.
  useEffect(() => {
    if (!profile) return
    setFormData({
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      phone: profile.phone ?? '',
      department: departmentName,
    })
  }, [profile, departmentName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Profile updated successfully!')
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-4xl font-bold">
              {profile ? initials(profile.first_name, profile.last_name) : '?'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-gray-600">{profile?.email}</p>
              <p className="text-gray-500 text-sm">{profile?.job_title}</p>
              <p className="text-blue-600 font-medium mt-2">
                {role?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">Contact admin to change</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Changes
              </button>
              <button
                type="button"
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Security</h3>
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            Change Password
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
