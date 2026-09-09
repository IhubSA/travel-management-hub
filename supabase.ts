// ============================================================================
// Supabase client
//
// NOTE: the app currently runs on the mock data layer (src/lib/mock-db.ts) and
// does not call Supabase. This client is kept configured and ready so that
// switching over is a matter of rewriting the service function bodies.
//
// It deliberately does NOT throw when the environment variables are absent —
// a missing key would otherwise crash the whole app at module load, including
// every page that never touches Supabase.
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

/** True once real credentials are present in the environment. */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
})
