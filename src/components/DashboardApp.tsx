import React, { useEffect, useState } from 'react';
import { getUser, getLoading, subscribeToAuth } from '../lib/auth';
import Dashboard from './Dashboard';

export default function DashboardApp() {
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState(getUser());
  const [loading, setLoading] = useState(getLoading());
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    
    // Check for auth errors from URL parameters
    const storedError = sessionStorage.getItem('authError');
    if (storedError) {
      setAuthError(storedError);
      sessionStorage.removeItem('authError');
    }
    
    // Subscribe to auth changes
    const unsubscribe = subscribeToAuth(() => {
      setUser(getUser());
      setLoading(getLoading());
    });
    
    return unsubscribe;
  }, []);

  // Redirect to login if not authenticated - this must be before any conditional returns
  useEffect(() => {
    if (isClient && !loading && !user) {
      const redirectUrl = authError ? `/login?error=${encodeURIComponent(authError)}` : '/login';
      window.location.href = redirectUrl;
    }
  }, [user, loading, isClient, authError]);

  // Show loading state only during initial client render
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show loading state while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show dashboard for authenticated users
  return <Dashboard />;
}
