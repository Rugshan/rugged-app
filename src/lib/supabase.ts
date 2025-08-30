import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
