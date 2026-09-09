'use client'

// ============================================================================
// Auth context
//
// MOCK MODE: the app signs in as one of the seeded profiles in mock-db.ts.
// The active identity can be switched at runtime (see the role switcher in the
// header), which is how all six role dashboards get tested without a backend.
//
// TO SWITCH TO SUPABASE: set MOCK_AUTH to false. The real Supabase branch
// below fetches the profile row for the signed-in auth user; everything that
// consumes this context (useRole, ProtectedRoute, every page) keeps working
// because the shape of `profile` is the same ProfileRow either way.
// ============================================================================

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { db, SEED_PROFILE_IDS } from '@/lib/mock-db'
import type { ProfileRow, UserRole } from '@/types/database'

/** Flip to false once the Supabase database and auth are live. */
const MOCK_AUTH = true

/** Which seeded profile each role signs in as. */
const ROLE_TO_PROFILE_ID: Record<UserRole, string> = {
  SUPER_ADMIN: SEED_PROFILE_IDS.ADMIN,
  CEO: SEED_PROFILE_IDS.CEO,
  FINANCE: SEED_PROFILE_IDS.FINANCE,
  TRAVEL_OFFICER: SEED_PROFILE_IDS.TRAVEL_OFFICER,
  HOD: SEED_PROFILE_IDS.HOD_OPS,
  STAFF: SEED_PROFILE_IDS.STAFF_NOMSA,
}

const STORAGE_KEY = 'arc-travel-hub.demo-profile-id'

/** Default identity when nothing has been chosen yet. */
const DEFAULT_PROFILE_ID = SEED_PROFILE_IDS.ADMIN

interface AuthContextType {
  user: User | null
  profile: ProfileRow | null
  session: Session | null
  loading: boolean
  error: string | null
  /** True while running on the mock data layer. */
  isMock: boolean
  /** Sign in as a different seeded profile (demo only). */
  switchProfile: (profileId: string) => void
  /** Sign in as the seeded profile for a role (demo only). */
  switchRole: (role: UserRole) => void
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mockUserFor(profile: ProfileRow): User {
  return {
    id: profile.auth_user_id,
    email: profile.email,
    aud: 'authenticated',
    created_at: profile.created_at,
    app_metadata: {},
    user_metadata: {
      first_name: profile.first_name,
      last_name: profile.last_name,
    },
  } as unknown as User
}

function mockSessionFor(user: User): Session {
  return {
    user,
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  } as unknown as Session
}

function readStoredProfileId(): string {
  if (typeof window === 'undefined') return DEFAULT_PROFILE_ID
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && db.profiles.some((p) => p.id === stored)) return stored
  } catch {
    // Storage unavailable (private window, blocked cookies) — use the default.
  }
  return DEFAULT_PROFILE_ID
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const applyMockProfile = useCallback((profileId: string) => {
    const found =
      db.profiles.find((p) => p.id === profileId) ??
      db.profiles.find((p) => p.id === DEFAULT_PROFILE_ID) ??
      db.profiles[0]

    if (!found) {
      setError('No seeded profiles available')
      return
    }

    const mockUser = mockUserFor(found)
    setUser(mockUser)
    setSession(mockSessionFor(mockUser))
    setProfile(found)
    setError(null)

    try {
      window.localStorage.setItem(STORAGE_KEY, found.id)
    } catch {
      // Non-fatal — the identity just won't survive a refresh.
    }
  }, [])

  // Initialise
  useEffect(() => {
    if (MOCK_AUTH) {
      applyMockProfile(readStoredProfileId())
      setLoading(false)
      return
    }

    // ---- Real Supabase path (inactive while MOCK_AUTH is true) ----
    let subscription: { unsubscribe: () => void } | undefined

    const initialise = async () => {
      try {
        const {
          data: { session: existingSession },
          error: sessionError,
        } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (existingSession?.user) {
          setSession(existingSession)
          setUser(existingSession.user)

          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', existingSession.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') throw profileError
          if (profileData) setProfile(profileData as ProfileRow)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialise auth')
      } finally {
        setLoading(false)
      }
    }

    initialise()

    const listener = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setError(null)

      if (newSession?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', newSession.user.id)
          .single()
        setProfile((profileData as unknown as ProfileRow | null) ?? null)
      } else {
        setProfile(null)
      }
    })
    subscription = listener.data.subscription

    return () => subscription?.unsubscribe()
  }, [applyMockProfile])

  const switchProfile = useCallback(
    (profileId: string) => {
      if (!MOCK_AUTH) return
      applyMockProfile(profileId)
    },
    [applyMockProfile]
  )

  const switchRole = useCallback(
    (role: UserRole) => {
      if (!MOCK_AUTH) return
      applyMockProfile(ROLE_TO_PROFILE_ID[role])
    },
    [applyMockProfile]
  )

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      if (!MOCK_AUTH) {
        const { error: signOutError } = await supabase.auth.signOut()
        if (signOutError) throw signOutError
      } else {
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          // Non-fatal.
        }
      }
      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log out')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshSession = useCallback(async () => {
    if (MOCK_AUTH) return
    try {
      const { data, error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) throw refreshError
      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh session')
      throw err
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        error,
        isMock: MOCK_AUTH,
        switchProfile,
        switchRole,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
