import React, { useState } from 'react';
import { getUser, signOut } from '../lib/auth';
import EntryForm from './EntryForm';
import EntriesList from './EntriesList';
import { LogOut, User } from 'lucide-react';

export default function Dashboard() {
  const user = getUser();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEntryAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Fitness Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
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
            <EntryForm onEntryAdded={handleEntryAdded} />
          </div>

          {/* Entries List */}
          <div className="lg:col-span-2">
            <EntriesList key={refreshKey} />
          </div>
        </div>
      </main>
    </div>
  );
}
