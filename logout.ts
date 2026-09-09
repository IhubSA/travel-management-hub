import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

interface LogoutResponse {
  success?: boolean
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get the session from the request
    const { data, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !data.session) {
      // Not logged in, that's fine
      return res.status(200).json({ success: true })
    }

    // Sign out
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return res.status(500).json({ error: 'Failed to logout' })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Logout API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
