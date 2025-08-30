import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

// Create a dummy client for SSR if environment variables are missing
export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co',
  supabaseAnonKey || 'dummy-key'
)

// Database types
export interface Entry {
  id: string
  user_id: string
  created_at: string
  type: string
  value: number
  unit: string
  notes?: string
}

export interface NewEntry {
  type: string
  value: number
  unit: string
  notes?: string
}
