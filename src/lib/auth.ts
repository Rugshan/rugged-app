import { supabase, siteUrl } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

// Global state
let currentUser: User | null = null;
let currentSession: Session | null = null;
let isLoading = true;
let authListeners: Array<() => void> = [];

// Initialize auth
export async function initializeAuth() {
  if (!supabase) {
    isLoading = false;
    notifyListeners();
    return;
  }

  try {
    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    currentSession = session;
    currentUser = session?.user ?? null;
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      currentSession = session;
      currentUser = session?.user ?? null;
      notifyListeners();
    });

    isLoading = false;
    notifyListeners();
  } catch (error) {
    console.error('Auth initialization error:', error);
    isLoading = false;
    notifyListeners();
  }
}

// Auth functions
export async function signIn(email: string, password: string) {
  if (!supabase) {
    return { error: { message: 'Authentication service not configured' } };
  }
  
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: { message: 'Authentication service not available' } };
  }
}

export async function signUp(email: string, password: string) {
  if (!supabase) {
    return { error: { message: 'Authentication service not configured' } };
  }
  
  try {
    // Use the environment variable for the app URL
    const appUrl = import.meta.env.NEXT_PUBLIC_APP_URL || 
      import.meta.env.PUBLIC_SITE_URL || 
      (typeof window !== 'undefined' ? window.location.origin : siteUrl);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`
      }
    });
    return { error };
  } catch (error) {
    console.error('Sign up error:', error);
    return { error: { message: 'Authentication service not available' } };
  }
}

// Apple Sign-In temporarily disabled - requires paid Apple Developer account
/*
export async function signInWithApple() {
  if (!supabase) {
    return { error: { message: 'Authentication service not configured' } };
  }
  
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${siteUrl}/auth/callback`
      }
    });
    return { data, error };
  } catch (error) {
    console.error('Apple sign in error:', error);
    return { error: { message: 'Apple Sign-In is not available' } };
  }
}
*/

export async function signOut() {
  if (!supabase) {
    return;
  }
  
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

// State getters
export function getUser() {
  return currentUser;
}

export function getSession() {
  return currentSession;
}

export function getLoading() {
  return isLoading;
}

// Listener management
export function subscribeToAuth(callback: () => void) {
  authListeners.push(callback);
  return () => {
    const index = authListeners.indexOf(callback);
    if (index > -1) {
      authListeners.splice(index, 1);
    }
  };
}

function notifyListeners() {
  authListeners.forEach(callback => callback());
}

// Initialize auth when this module is loaded
if (typeof window !== 'undefined') {
  initializeAuth();
}
