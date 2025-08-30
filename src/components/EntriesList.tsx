import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Entry } from '../lib/supabase';
import { Droplets, Beef, Apple, Coffee, Activity, Trash2, Clock, Flame } from 'lucide-react';

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

export default function EntriesList({ currentTheme }: { currentTheme?: boolean }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    if (!supabase) {
      setError('Database service not configured');
      setLoading(false);
      return;
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .gte('created_at', today.toISOString())
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
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
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
    <div className="space-y-6">
      {/* Totals Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Today's Totals</h3>
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Today's Entries</h3>
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
              {filter === 'all' ? 'No entries for today' : `No ${filter} entries for today`}
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
