import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  success?: boolean
  user?: {
    id: string
    email: string
  }
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body as LoginRequest

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Don't reveal whether email exists or not (security)
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    if (!data.user || !data.session) {
      return res.status(401).json({ error: 'Failed to create session' })
    }

    // Return success - session is stored in HTTP-only cookie by Supabase client
    return res.status(200).json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || '',
      },
    })
  } catch (error) {
    console.error('Login API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
