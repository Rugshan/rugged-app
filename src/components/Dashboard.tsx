import React, { useState, useEffect } from 'react';
import { getUser, signOut } from '../lib/auth';
import EntryForm from './EntryForm';
import EntriesList from './EntriesList';
import Metrics from './Metrics';
import Settings from './Settings';
import { LogOut, User, List, BarChart3, Settings as SettingsIcon } from 'lucide-react';

export default function Dashboard() {
  const user = getUser();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<'entries' | 'metrics' | 'settings'>('entries');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    setIsClient(true);
    
    // Handle hash navigation
    const handleHashChange = () => {
      if (window.location.hash === '#settings') {
        setActiveTab('settings');
      }
    };

    // Check initial hash
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleEntryAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">💪🏽 Rugged</h1>
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

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('entries')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'entries'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span>Entries</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'metrics'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Metrics</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center space-x-2">
                <SettingsIcon className="h-4 w-4" />
                <span>Settings</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'entries' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Entry Form */}
            <div className="lg:col-span-1">
              <EntryForm 
                onEntryAdded={handleEntryAdded} 
                currentTheme={true} 
                selectedDate={selectedDate}
              />
            </div>

            {/* Entries List */}
            <div className="lg:col-span-2">
              <EntriesList 
                key={refreshKey} 
                currentTheme={true} 
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
              />
            </div>
          </div>
        ) : activeTab === 'metrics' ? (
          <Metrics currentTheme={true} />
        ) : (
          <Settings />
        )}
      </main>
    </div>
  );
}
