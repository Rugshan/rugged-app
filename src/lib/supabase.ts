import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

// Only create client if we have valid environment variables
let supabase: any = null;

// Check if environment variables are valid URLs/keys
if (supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    supabaseAnonKey.length > 20) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
  }
}

// Export a safe client that handles missing configuration
export { supabase };

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
  user_id: string
  type: string
  value: number
  unit: string
  notes?: string
}
