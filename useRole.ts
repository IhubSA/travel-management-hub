'use client'

import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types/database'
import type { Viewer } from '@/services/travel-request.service'

export function useRole() {
  const { profile } = useAuth()
  const role = profile?.role ?? null

  return {
    role,
    isSuperAdmin: role === 'SUPER_ADMIN',
    isStaff: role === 'STAFF',
    isHOD: role === 'HOD',
    isTravelOfficer: role === 'TRAVEL_OFFICER',
    isFinance: role === 'FINANCE',
    isCEO: role === 'CEO',
    /** True for any role that reviews or approves requests. */
    isApprover:
      role === 'HOD' ||
      role === 'TRAVEL_OFFICER' ||
      role === 'FINANCE' ||
      role === 'CEO' ||
      role === 'SUPER_ADMIN',
    hasRole: (target: UserRole | UserRole[]) => {
      if (!role) return false
      return Array.isArray(target) ? target.includes(role) : role === target
    },
  }
}

/**
 * The identity the service layer filters by. Null until the profile loads.
 * Memoised so it can be used safely in effect dependency arrays.
 */
export function useViewer(): Viewer | null {
  const { profile } = useAuth()

  return useMemo(() => {
    if (!profile) return null
    return {
      profileId: profile.id,
      role: profile.role,
      departmentId: profile.department_id,
    }
  }, [profile])
}
