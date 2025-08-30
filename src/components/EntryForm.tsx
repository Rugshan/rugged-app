import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { NewEntry } from '../lib/supabase';
import { Plus, Droplets, Beef, Apple, Coffee, Activity } from 'lucide-react';

const entryTypes = [
  { value: 'water', label: 'Water', icon: Droplets, color: 'text-blue-500' },
  { value: 'protein', label: 'Protein', icon: Beef, color: 'text-red-500' },
  { value: 'carbs', label: 'Carbs', icon: Apple, color: 'text-green-500' },
  { value: 'caffeine', label: 'Caffeine', icon: Coffee, color: 'text-yellow-600' },
  { value: 'exercise', label: 'Exercise', icon: Activity, color: 'text-purple-500' },
];

const units = {
  water: 'ml',
  protein: 'g',
  carbs: 'g',
  caffeine: 'mg',
  exercise: 'min',
};

export default function EntryForm({ onEntryAdded }: { onEntryAdded: () => void }) {
  const [type, setType] = useState('water');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const newEntry: NewEntry = {
        type,
        value: parseFloat(value),
        unit: units[type as keyof typeof units],
        notes: notes.trim() || undefined,
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
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Entry</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Entry Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <div className="grid grid-cols-5 gap-2">
            {entryTypes.map((entryType) => {
              const Icon = entryType.icon;
              return (
                <button
                  key={entryType.value}
                  type="button"
                  onClick={() => setType(entryType.value)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    type === entryType.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`h-6 w-6 mx-auto ${entryType.color}`} />
                  <span className="block text-xs mt-1 text-gray-600">
                    {entryType.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Value Input */}
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
            Amount ({units[type as keyof typeof units]})
          </label>
          <input
            type="number"
            id="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            min="0"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder={`Enter amount in ${units[type as keyof typeof units]}`}
          />
        </div>

        {/* Notes Input */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any notes..."
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !value}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
