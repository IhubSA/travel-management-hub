'use client'

import { useAuth } from '@/context/AuthContext'
import type { Database } from '@/types/database'

type UserRole = Database['public']['Enums']['user_role']

export function useRole() {
  const { profile } = useAuth()

  return {
    role: (profile?.user_role as UserRole | undefined) || null,
    isSuperAdmin: profile?.user_role === 'SUPER_ADMIN',
    isStaff: profile?.user_role === 'STAFF',
    isHOD: profile?.user_role === 'HOD',
    isTravelOfficer: profile?.user_role === 'TRAVEL_OFFICER',
    isFinance: profile?.user_role === 'FINANCE',
    isCEO: profile?.user_role === 'CEO',
    hasRole: (role: UserRole | UserRole[]) => {
      if (!profile?.user_role) return false
      return Array.isArray(role) ? role.includes(profile.role as UserRole) : profile.role === role
    },
  }
}
