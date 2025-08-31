import React, { useState, useEffect } from 'react';
import { getUserTimezone, setUserTimezone, getAvailableTimezones } from '../lib/timezone';
import { Globe, Check } from 'lucide-react';

export default function TimezoneSettings({ currentTheme }: { currentTheme?: boolean }) {
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [availableTimezones, setAvailableTimezones] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current timezone
    const currentTimezone = getUserTimezone();
    setSelectedTimezone(currentTimezone);
    
    // Get available timezones
    const timezones = getAvailableTimezones();
    setAvailableTimezones(timezones);
    setLoading(false);
  }, []);

  const handleTimezoneChange = (timezone: string) => {
    setSelectedTimezone(timezone);
    setUserTimezone(timezone);
  };

  const getCurrentTimeInTimezone = (timezone: string) => {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
      <div className="flex items-center space-x-2 mb-4">
        <Globe className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Timezone Settings</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Timezone
          </label>
          <select
            value={selectedTimezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
          >
            {availableTimezones.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone} ({getCurrentTimeInTimezone(timezone)})
              </option>
            ))}
          </select>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Current time in your timezone: <span className="font-medium">{getCurrentTimeInTimezone(selectedTimezone)}</span></p>
          <p className="mt-1">This setting affects how dates and times are displayed throughout the app.</p>
        </div>
        
        {selectedTimezone !== getUserTimezone() && (
          <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span>Timezone updated successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}
