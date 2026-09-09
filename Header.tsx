'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { db } from '@/lib/mock-db'
import { initials } from '@/utils/format'

export function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const notificationRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { profile, isMock, switchProfile, logout } = useAuth()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left: Logo / Title */}
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Travel Management Hub</h2>
            <p className="text-xs text-gray-600">Angels Resource Centres</p>
          </div>
        </div>

        {/* Right: Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Demo-only identity switcher. Disappears once real auth is on. */}
          {isMock && (
            <label className="hidden items-center gap-2 md:flex">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Viewing as
              </span>
              <select
                value={profile?.id ?? ''}
                onChange={(e) => switchProfile(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                title="Switch role to see the app as a different user"
              >
                {db.profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} — {p.role.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>
          )}

          {/* Notification Bell */}
          <div ref={notificationRef} className="relative">
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              title="Notifications"
            >
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer">
                    <p className="text-sm font-medium text-gray-900">New travel request pending approval</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                  <div className="p-4 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm font-medium text-gray-900">Your request has been approved</p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
                <div className="p-3 border-t border-gray-200 text-center">
                  <Link href="/approvals" className="text-xs text-blue-600 hover:text-blue-700">
                    Go to approvals
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                {profile ? initials(profile.first_name, profile.last_name) : '?'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {profile ? `${profile.first_name} ${profile.last_name}` : '—'}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.role.replace(/_/g, ' ')}
                </p>
              </div>
              <span className="text-gray-400">▼</span>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">
                    {profile ? `${profile.first_name} ${profile.last_name}` : '—'}
                  </p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
                <div className="py-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    👤 My Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    ⚙️ Settings
                  </Link>
                </div>
                <div className="border-t border-gray-200 p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
