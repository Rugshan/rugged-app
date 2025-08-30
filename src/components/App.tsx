import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import LoginForm from './LoginForm';
import Dashboard from './Dashboard';

export default function App() {
  const [isClient, setIsClient] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR and initial client render
  if (!isClient || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <Dashboard /> : <LoginForm />;
}
