import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['profiles']['Row']

interface SessionResponse {
  authenticated?: boolean
  user?: {
    id: string
    email: string
  }
  profile?: UserProfile | null
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SessionResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the current session
    const { data, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Session error:', sessionError)
      return res.status(401).json({ authenticated: false })
    }

    if (!data.session?.user) {
      return res.status(200).json({ authenticated: false })
    }

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('auth_user_id', data.session.user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError)
      return res.status(500).json({ error: 'Failed to fetch profile' })
    }

    return res.status(200).json({
      authenticated: true,
      user: {
        id: data.session.user.id,
        email: data.session.user.email || '',
      },
      profile: profileData || undefined,
    })
  } catch (error) {
    console.error('Session API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
