'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useRole } from '@/hooks/useRole'

interface NavItem {
  label: string
  href: string
  icon: string
  roles: string[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    roles: ['SUPER_ADMIN', 'CEO', 'HOD', 'STAFF', 'TRAVEL_OFFICER', 'FINANCE'],
  },
  {
    label: 'Travel Requests',
    href: '/travel-requests',
    icon: '✈️',
    roles: ['SUPER_ADMIN', 'STAFF', 'TRAVEL_OFFICER', 'HOD'],
  },
  {
    label: 'Approvals',
    href: '/approvals',
    icon: '✅',
    roles: ['SUPER_ADMIN', 'HOD', 'TRAVEL_OFFICER', 'CEO'],
  },
  {
    label: 'Finance',
    href: '/finance',
    icon: '💰',
    roles: ['SUPER_ADMIN', 'FINANCE', 'CEO'],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: '📈',
    roles: ['SUPER_ADMIN', 'CEO', 'FINANCE', 'HOD'],
  },
  {
    label: 'Users & Roles',
    href: '/admin/users',
    icon: '👥',
    roles: ['SUPER_ADMIN', 'CEO'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: '⚙️',
    roles: ['SUPER_ADMIN', 'CEO', 'STAFF'],
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: '👤',
    roles: ['SUPER_ADMIN', 'CEO', 'HOD', 'STAFF', 'TRAVEL_OFFICER', 'FINANCE'],
  },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const { user, logout } = useAuth()
  const { role } = useRole()

  // Filter nav items based on user role
  const visibleItems = navItems.filter((item) =>
    role ? item.roles.includes(role) : false
  )

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 md:hidden bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gray-900 text-white transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : '-translate-x-full'
        } md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold">Travel Hub</h1>
              <p className="text-xs text-gray-400">Angels Resource Centres</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block text-gray-400 hover:text-white"
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* User Info */}
        {!isCollapsed && (
          <div className="p-4 bg-gray-800 mx-2 mt-4 rounded-lg">
            <p className="text-xs text-gray-400">Logged in as</p>
            <p className="text-sm font-medium truncate">{user?.email}</p>
            {role && <p className="text-xs text-blue-400 mt-1">{role}</p>}
          </div>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                title={isCollapsed ? item.label : ''}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer / Logout */}
        <div className="border-t border-gray-700 p-4">
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          )}
          {isCollapsed && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-xl"
              title="Logout"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Spacer */}
      <div className={`${isCollapsed ? 'md:ml-20' : 'md:ml-64'} transition-all duration-300`}>
        {/* Content goes here */}
      </div>
    </>
  )
}
