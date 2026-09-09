// Auto-generated Supabase types
// Generate with: npm run db:types

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          user_role: Database['public']['Enums']['user_role']
          department_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          user_role?: Database['public']['Enums']['user_role']
          department_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          user_role?: Database['public']['Enums']['user_role']
          department_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Enums: {
      user_role: 'SUPER_ADMIN' | 'STAFF' | 'HOD' | 'TRAVEL_OFFICER' | 'FINANCE' | 'CEO'
    }
  }
}
