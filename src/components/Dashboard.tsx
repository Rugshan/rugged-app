import React, { useState, useEffect } from 'react';
import { getUser, signOut } from '../lib/auth';
import EntryForm from './EntryForm';
import EntriesList from './EntriesList';
import { LogOut, User } from 'lucide-react';

export default function Dashboard() {
  const user = getUser();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEntryAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rugged</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* User Info - Hidden on mobile, shown on desktop */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <User className="h-4 w-4" />
                <span className="truncate max-w-32">{user?.email}</span>
              </div>
              
              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Entry Form */}
          <div className="lg:col-span-1">
            <EntryForm onEntryAdded={handleEntryAdded} currentTheme={true} />
          </div>

          {/* Entries List */}
          <div className="lg:col-span-2">
            <EntriesList key={refreshKey} currentTheme={true} />
          </div>
        </div>
      </main>
    </div>
  );
}
