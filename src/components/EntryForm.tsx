import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { NewEntry, QuickAdd } from '../lib/supabase';
import { getUser } from '../lib/auth';
import { Plus, Droplets, Beef, Apple, Coffee, Activity, Flame } from 'lucide-react';

const entryTypes = [
  { value: 'water', label: 'Water', icon: Droplets, color: 'text-blue-500' },
  { value: 'protein', label: 'Protein', icon: Beef, color: 'text-red-500' },
  { value: 'carbs', label: 'Carbs', icon: Apple, color: 'text-green-500' },
  { value: 'calories', label: 'Calories', icon: Flame, color: 'text-orange-500' },
  { value: 'caffeine', label: 'Caffeine', icon: Coffee, color: 'text-yellow-600' },
  { value: 'exercise', label: 'Exercise', icon: Activity, color: 'text-purple-500' },
];

const units = {
  water: 'ml',
  protein: 'g',
  carbs: 'g',
  calories: 'kcal',
  caffeine: 'mg',
  exercise: 'min',
};

export default function EntryForm({ onEntryAdded, currentTheme, selectedDate }: { onEntryAdded: () => void; currentTheme?: boolean; selectedDate?: Date }) {
  const [type, setType] = useState('water');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickadds, setQuickadds] = useState<QuickAdd[]>([]);

  useEffect(() => {
    loadQuickadds();
  }, []);

  const loadQuickadds = async () => {
    if (!supabase) return;

    try {
      const user = getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('quickadds')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (!error && data) {
        setQuickadds(data);
      }
    } catch (err) {
      console.error('Error loading quickadds:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!supabase) {
      setError('Database service not configured');
      setLoading(false);
      return;
    }

    try {
      const user = getUser();
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Create a timestamp for the selected date with current time
      const entryDate = selectedDate || new Date();
      const now = new Date();
      const entryTimestamp = new Date(entryDate);
      entryTimestamp.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
      
      // Convert to UTC to ensure consistent timezone handling
      const timezoneOffset = entryTimestamp.getTimezoneOffset() * 60000;
      const utcTimestamp = new Date(entryTimestamp.getTime() - timezoneOffset);

      const newEntry: NewEntry = {
        user_id: user.id,
        type,
        value: parseFloat(value),
        unit: units[type as keyof typeof units],
        notes: notes.trim() || undefined,
        created_at: utcTimestamp.toISOString(),
      };

      const { error } = await supabase
        .from('entries')
        .insert([newEntry]);

      if (error) {
        setError(error.message);
      } else {
        setValue('');
        setNotes('');
        onEntryAdded();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Entry</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Entry Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
            {entryTypes.map((entryType) => {
              const Icon = entryType.icon;
              return (
                <button
                  key={entryType.value}
                  type="button"
                  onClick={() => setType(entryType.value)}
                  className={`p-2 rounded-lg border-2 transition-colors ${
                    type === entryType.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <Icon className={`h-5 w-5 mx-auto ${entryType.color}`} />
                  <span className="block text-xs mt-1 text-gray-600 dark:text-gray-400 text-center leading-tight hyphens-auto break-words">
                    {entryType.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Value Input */}
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount ({units[type as keyof typeof units]})
          </label>
          
          {/* Quick Add Buttons */}
          {quickadds.filter(qa => qa.type === type).length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {quickadds
                .filter(qa => qa.type === type)
                .map((quickAdd) => (
                  <button
                    key={quickAdd.id}
                    type="button"
                    onClick={() => setValue(quickAdd.amount.toString())}
                    className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    {quickAdd.label} ({quickAdd.amount}{quickAdd.unit})
                  </button>
                ))}
            </div>
          )}
          
          <input
            type="number"
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            placeholder={`Enter amount in ${units[type as keyof typeof units]}`}
          />
        </div>

        {/* Notes Input */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
            placeholder="Add any notes..."
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3">
            <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !value}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </>
          )}
        </button>
      </form>
    </div>
  );
}
