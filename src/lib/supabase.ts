import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY
// Automatically detect the correct site URL
const getSiteUrl = () => {
  // If environment variable is set, use it
  if (import.meta.env.PUBLIC_SITE_URL) {
    return import.meta.env.PUBLIC_SITE_URL;
  }
  
  // If running in browser, use the current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback for server-side rendering
  return 'http://localhost:4321';
};

const siteUrl = getSiteUrl();

// Only create client if we have valid environment variables
let supabase: any = null;

// Check if environment variables are valid URLs/keys
if (supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    supabaseAnonKey.length > 20) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
  }
}

// Export a safe client that handles missing configuration
export { supabase, siteUrl };

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
  created_at?: string
}

export interface QuickAdd {
  id: string
  user_id: string
  created_at: string
  type: string
  label: string
  amount: number
  unit: string
  sort_order: number
}

export interface NewQuickAdd {
  user_id: string
  type: string
  label: string
  amount: number
  unit: string
  sort_order?: number
}

export interface Goal {
  id: string
  user_id: string
  created_at: string
  type: string
  target: number
  unit: string
  sort_order: number
}

export interface NewGoal {
  user_id: string
  type: string
  target: number
  unit: string
  sort_order?: number
}
