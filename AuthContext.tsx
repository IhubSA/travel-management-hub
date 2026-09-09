'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  error: string | null
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // MOCK AUTH - Remove this when using real Supabase
        const isMockMode = true

        if (isMockMode) {
          // Create mock user for development/demo
          const mockUser = {
            id: 'mock-user-001',
            email: 'demo@angels-travel.example.com',
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            user_metadata: {},
            app_metadata: {},
          } as any

          const mockSession = {
            user: mockUser,
            session: null,
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            expires_at: Date.now() + 3600000,
            token_type: 'Bearer',
          } as any

          // Create mock profile - change role here to test different dashboards
          const mockProfile = {
            id: 'mock-user-001',
            email: 'demo@angels-travel.example.com',
            first_name: 'Demo',
            last_name: 'User',
            user_role: 'SUPER_ADMIN', // Change to: SUPER_ADMIN, CEO, HOD, STAFF, TRAVEL_OFFICER, FINANCE
            department_id: 'dept-001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any

          setSession(mockSession)
          setUser(mockUser)
          setProfile(mockProfile)
          setLoading(false)
          return
        }

        // Check if we have an existing session
        const {
          data: { session: existingSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (existingSession?.user) {
          setSession(existingSession)
          setUser(existingSession.user)

          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', existingSession.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 = no rows returned, which is expected for new users
            throw profileError
          }

          if (profileData) {
            setProfile(profileData)
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to initialize auth'
        setError(message)
        console.error('Auth initialization error:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user || null)
      setError(null)

      // Fetch profile when user changes
      if (newSession?.user) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', newSession.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError
          }

          setProfile(profileData || null)
        } catch (err) {
          console.error('Failed to fetch profile:', err)
        }
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const logout = async () => {
    try {
      setLoading(true)
      // In mock mode, just clear the state
      const isMockMode = true
      if (!isMockMode) {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      }

      setUser(null)
      setProfile(null)
      setSession(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to logout'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) throw error

      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to refresh session'
      setError(message)
      throw err
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        error,
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
