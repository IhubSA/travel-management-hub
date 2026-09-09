'use client'

import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

export function useRole() {
  const { profile } = useAuth()

  return {
    role: (profile?.role as UserRole | undefined) || null,
    isSuperAdmin: profile?.role === 'SUPER_ADMIN',
    isStaff: profile?.role === 'STAFF',
    isHOD: profile?.role === 'HOD',
    isTravelOfficer: profile?.role === 'TRAVEL_OFFICER',
    isFinance: profile?.role === 'FINANCE',
    isCEO: profile?.role === 'CEO',
    hasRole: (role: UserRole | UserRole[]) => {
      if (!profile?.role) return false
      return Array.isArray(role) ? role.includes(profile.role as UserRole) : profile.role === role
    },
  }
}
