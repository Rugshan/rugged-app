import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { QuickAdd, NewQuickAdd, Goal, NewGoal } from '../lib/supabase';
import { getUser } from '../lib/auth';
import { Plus, Trash2, Save, X, Droplets, Beef, Apple, Coffee, Activity, Flame, Target, Globe } from 'lucide-react';
import TimezoneSettings from './TimezoneSettings';

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

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'quickadds' | 'goals' | 'timezone'>('quickadds');
  const [quickadds, setQuickadds] = useState<QuickAdd[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuickAdd, setEditingQuickAdd] = useState<QuickAdd | null>(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [quickAddFormData, setQuickAddFormData] = useState({
    type: 'water',
    label: '',
    amount: '',
  });
  const [goalFormData, setGoalFormData] = useState({
    type: 'water',
    target: '',
  });

  useEffect(() => {
    loadQuickadds();
    loadGoals();
    
    // Check if we should show the goals tab (e.g., from metrics page)
    if (window.location.hash === '#settings') {
      setActiveTab('goals');
    }
  }, []);

  const loadQuickadds = async () => {
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

      const { data, error } = await supabase
        .from('quickadds')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setQuickadds(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadGoals = async () => {
    if (!supabase) return;

    try {
      const user = getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true });

      if (error) {
        setError(error.message);
      } else {
        setGoals(data || []);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleAddQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    try {
      const user = getUser();
      if (!user) return;

      const newQuickAdd: NewQuickAdd = {
        user_id: user.id,
        type: quickAddFormData.type,
        label: quickAddFormData.label.trim(),
        amount: parseFloat(quickAddFormData.amount),
        unit: units[quickAddFormData.type as keyof typeof units],
        sort_order: quickadds.length,
      };

      const { error } = await supabase
        .from('quickadds')
        .insert([newQuickAdd]);

      if (error) {
        setError(error.message);
      } else {
        setQuickAddFormData({ type: 'water', label: '', amount: '' });
        setShowAddForm(false);
        loadQuickadds();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleUpdateQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !editingQuickAdd) return;

    try {
      const { error } = await supabase
        .from('quickadds')
        .update({
          type: quickAddFormData.type,
          label: quickAddFormData.label.trim(),
          amount: parseFloat(quickAddFormData.amount),
          unit: units[quickAddFormData.type as keyof typeof units],
        })
        .eq('id', editingQuickAdd.id);

      if (error) {
        setError(error.message);
      } else {
        setQuickAddFormData({ type: 'water', label: '', amount: '' });
        setEditingQuickAdd(null);
        loadQuickadds();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleDeleteQuickAdd = async (id: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('quickadds')
        .delete()
        .eq('id', id);

      if (error) {
        setError(error.message);
      } else {
        loadQuickadds();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const startEdit = (quickadd: QuickAdd) => {
    setEditingQuickAdd(quickadd);
    setQuickAddFormData({
      type: quickadd.type,
      label: quickadd.label,
      amount: quickadd.amount.toString(),
    });
  };

  const cancelEdit = () => {
    setEditingQuickAdd(null);
    setQuickAddFormData({ type: 'water', label: '', amount: '' });
  };

  // Goal management functions
  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    try {
      const user = getUser();
      if (!user) return;

      const newGoal: NewGoal = {
        user_id: user.id,
        type: goalFormData.type,
        target: parseFloat(goalFormData.target),
        unit: units[goalFormData.type as keyof typeof units],
        sort_order: goals.length,
      };

      const { error } = await supabase
        .from('goals')
        .insert([newGoal]);

      if (error) {
        setError(error.message);
      } else {
        setGoalFormData({ type: 'water', target: '' });
        setShowGoalForm(false);
        loadGoals();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !editingGoal) return;

    try {
      const { error } = await supabase
        .from('goals')
        .update({
          type: goalFormData.type,
          target: parseFloat(goalFormData.target),
          unit: units[goalFormData.type as keyof typeof units],
        })
        .eq('id', editingGoal.id);

      if (error) {
        setError(error.message);
      } else {
        setGoalFormData({ type: 'water', target: '' });
        setEditingGoal(null);
        loadGoals();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (error) {
        setError(error.message);
      } else {
        loadGoals();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const startEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalFormData({
      type: goal.type,
      target: goal.target.toString(),
    });
  };

  const cancelEditGoal = () => {
    setEditingGoal(null);
    setGoalFormData({ type: 'water', target: '' });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Settings</h3>
      
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 mb-4">
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('quickadds')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'quickadds'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Quick Adds
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'goals'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Goals
          </button>
          <button
            onClick={() => setActiveTab('timezone')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'timezone'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Globe className="h-4 w-4 inline mr-1" />
            Timezone
          </button>
        </div>
      </div>

      {/* Quick Adds Tab */}
      {activeTab === 'quickadds' && (
        <div>
          {/* Quick Add List */}
          <div className="space-y-3 mb-6">
            {quickadds.map((quickadd) => (
              <div
                key={quickadd.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {(() => {
                    const entryType = entryTypes.find(t => t.value === quickadd.type);
                    const Icon = entryType?.icon || Droplets;
                    return (
                      <Icon className={`h-5 w-5 ${entryType?.color || 'text-blue-500'}`} />
                    );
                  })()}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {quickadd.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {quickadd.amount} {quickadd.unit} ({quickadd.type})
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(quickadd)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuickAdd(quickadd.id)}
                    className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Quick Add Form */}
          {!showAddForm && !editingQuickAdd && (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex justify-center items-center py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Quick Add
            </button>
          )}

          {/* Form for adding/editing quick adds */}
          {(showAddForm || editingQuickAdd) && (
            <form onSubmit={editingQuickAdd ? handleUpdateQuickAdd : handleAddQuickAdd} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">
                  {editingQuickAdd ? 'Edit Quick Add' : 'Add New Quick Add'}
                </h4>
                <button
                  type="button"
                  onClick={editingQuickAdd ? cancelEdit : () => setShowAddForm(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {entryTypes.map((entryType) => {
                    const Icon = entryType.icon;
                    return (
                      <button
                        key={entryType.value}
                        type="button"
                        onClick={() => setQuickAddFormData({ ...quickAddFormData, type: entryType.value })}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          quickAddFormData.type === entryType.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mx-auto ${entryType.color}`} />
                        <span className="block text-xs mt-1 text-gray-600 dark:text-gray-400 text-center">
                          {entryType.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Label Input */}
              <div>
                <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Label
                </label>
                <input
                  type="text"
                  id="label"
                  value={quickAddFormData.label}
                  onChange={(e) => setQuickAddFormData({ ...quickAddFormData, label: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., Coffee Cup, Protein Shake"
                />
              </div>

              {/* Amount Input */}
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount ({units[quickAddFormData.type as keyof typeof units]})
                </label>
                <input
                  type="number"
                  id="amount"
                  value={quickAddFormData.amount}
                  onChange={(e) => setQuickAddFormData({ ...quickAddFormData, amount: e.target.value })}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`Enter amount in ${units[quickAddFormData.type as keyof typeof units]}`}
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {editingQuickAdd ? 'Update Quick Add' : 'Add Quick Add'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Goals Tab */}
      {activeTab === 'goals' && (
        <div>
          {/* Goals List */}
          <div className="space-y-3 mb-6">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {(() => {
                    const entryType = entryTypes.find(t => t.value === goal.type);
                    const Icon = entryType?.icon || Target;
                    return (
                      <Icon className={`h-5 w-5 ${entryType?.color || 'text-blue-500'}`} />
                    );
                  })()}
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white capitalize">
                      {goal.type}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Target: {goal.target} {goal.unit}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditGoal(goal)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Goal Form */}
          {!showGoalForm && !editingGoal && (
            <button
              onClick={() => setShowGoalForm(true)}
              className="w-full flex justify-center items-center py-2 px-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <Target className="h-4 w-4 mr-2" />
              Add Goal
            </button>
          )}

          {/* Form for adding/editing goals */}
          {(showGoalForm || editingGoal) && (
            <form onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">
                  {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                </h4>
                <button
                  type="button"
                  onClick={editingGoal ? cancelEditGoal : () => setShowGoalForm(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {entryTypes.map((entryType) => {
                    const Icon = entryType.icon;
                    return (
                      <button
                        key={entryType.value}
                        type="button"
                        onClick={() => setGoalFormData({ ...goalFormData, type: entryType.value })}
                        className={`p-2 rounded-lg border-2 transition-colors ${
                          goalFormData.type === entryType.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mx-auto ${entryType.color}`} />
                        <span className="block text-xs mt-1 text-gray-600 dark:text-gray-400 text-center">
                          {entryType.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Input */}
              <div>
                <label htmlFor="target" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Daily Target ({units[goalFormData.type as keyof typeof units]})
                </label>
                <input
                  type="number"
                  id="target"
                  value={goalFormData.target}
                  onChange={(e) => setGoalFormData({ ...goalFormData, target: e.target.value })}
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={`Enter daily target in ${units[goalFormData.type as keyof typeof units]}`}
                />
              </div>

              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                {editingGoal ? 'Update Goal' : 'Add Goal'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Timezone Tab */}
      {activeTab === 'timezone' && (
        <div>
          <TimezoneSettings />
        </div>
      )}
    </div>
  );
}
