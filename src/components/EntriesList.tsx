import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Entry } from '../lib/supabase';
import { Droplets, Beef, Apple, Coffee, Activity, Trash2, Clock, Flame, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const entryTypeIcons = {
  water: Droplets,
  protein: Beef,
  carbs: Apple,
  calories: Flame,
  caffeine: Coffee,
  exercise: Activity,
};

const entryTypeColors = {
  water: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
  protein: 'text-red-500 bg-red-100 dark:bg-red-900/30',
  carbs: 'text-green-500 bg-green-100 dark:bg-green-900/30',
  calories: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
  caffeine: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30',
  exercise: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
};

export default function EntriesList({ currentTheme, selectedDate, onDateChange }: { currentTheme?: boolean; selectedDate?: Date; onDateChange?: (date: Date) => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [localSelectedDate, setLocalSelectedDate] = useState(selectedDate || new Date());

  useEffect(() => {
    fetchEntries();
  }, [localSelectedDate]);

  // Update local state when prop changes
  useEffect(() => {
    if (selectedDate) {
      setLocalSelectedDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchEntries = async () => {
    if (!supabase) {
      setError('Database service not configured');
      setLoading(false);
      return;
    }

    try {
      const startOfDay = new Date(localSelectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(localSelectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setEntries(data || []);
      }
    } catch (err) {
      setError('Failed to fetch entries');
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!supabase) {
      setError('Database service not configured');
      return;
    }

    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id);

      if (error) {
        setError(error.message);
      } else {
        setEntries(entries.filter(entry => entry.id !== id));
      }
    } catch (err) {
      setError('Failed to delete entry');
    }
  };

  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(entry => entry.type === filter);

  const totals = entries.reduce((acc, entry) => {
    if (!acc[entry.type]) {
      acc[entry.type] = { value: 0, unit: entry.unit };
    }
    acc[entry.type].value += entry.value;
    return acc;
  }, {} as Record<string, { value: number; unit: string }>);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(localSelectedDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setLocalSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const isToday = () => {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    
    const selectedYear = localSelectedDate.getFullYear();
    const selectedMonth = localSelectedDate.getMonth();
    const selectedDay = localSelectedDate.getDate();
    
    return todayYear === selectedYear && todayMonth === selectedMonth && todayDay === selectedDay;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
                                       <input
                type="date"
                value={localSelectedDate.getFullYear() + '-' + 
                      String(localSelectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(localSelectedDate.getDate()).padStart(2, '0')}
                onChange={(e) => {
                  const newDate = new Date(e.target.value);
                  setLocalSelectedDate(newDate);
                  onDateChange?.(newDate);
                }}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
              />
             <span className="text-lg font-medium text-gray-900 dark:text-white">
               {formatDate(localSelectedDate)}
             </span>
             {!isToday() && (
               <button
                 onClick={() => {
                   const today = new Date();
                   setLocalSelectedDate(today);
                   onDateChange?.(today);
                 }}
                 className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
               >
                 Today
               </button>
             )}
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
           {isToday() ? "Today's Totals" : `${formatDate(localSelectedDate)} Totals`}
         </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {Object.entries(totals).map(([type, total]) => {
            const Icon = entryTypeIcons[type as keyof typeof entryTypeIcons];
            const colorClass = entryTypeColors[type as keyof typeof entryTypeColors];
            return (
              <div key={type} className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClass} mb-2`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {total.value.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {type} ({total.unit})
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Entries List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
                         <h3 className="text-lg font-medium text-gray-900 dark:text-white">
               {isToday() ? "Today's Entries" : `${formatDate(localSelectedDate)} Entries`}
             </h3>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            >
              <option value="all">All Types</option>
              <option value="water">Water</option>
              <option value="protein">Protein</option>
              <option value="carbs">Carbs</option>
              <option value="calories">Calories</option>
              <option value="caffeine">Caffeine</option>
              <option value="exercise">Exercise</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredEntries.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                             {filter === 'all' 
                 ? `No entries for ${isToday() ? 'today' : formatDate(localSelectedDate)}` 
                 : `No ${filter} entries for ${isToday() ? 'today' : formatDate(localSelectedDate)}`
               }
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const Icon = entryTypeIcons[entry.type as keyof typeof entryTypeIcons];
              const colorClass = entryTypeColors[entry.type as keyof typeof entryTypeColors];
              return (
                <div key={entry.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white capitalize">
                            {entry.type}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            {entry.value} {entry.unit}
                          </span>
                        </div>
                        {entry.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{entry.notes}</p>
                        )}
                        <div className="flex items-center space-x-2 text-xs text-gray-400 dark:text-gray-500 mt-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(entry.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
