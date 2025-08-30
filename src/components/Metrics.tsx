import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Entry } from '../lib/supabase';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  BarChart3, 
  Activity,
  Droplets,
  Beef,
  Apple,
  Flame,
  Coffee,
  Clock
} from 'lucide-react';

interface WeeklyData {
  date: string;
  water: number;
  protein: number;
  carbs: number;
  calories: number;
  caffeine: number;
  exercise: number;
}

interface Goal {
  type: string;
  target: number;
  unit: string;
  icon: any;
  color: string;
}

const defaultGoals: Goal[] = [
  { type: 'water', target: 2000, unit: 'ml', icon: Droplets, color: 'text-blue-500' },
  { type: 'protein', target: 150, unit: 'g', icon: Beef, color: 'text-red-500' },
  { type: 'carbs', target: 200, unit: 'g', icon: Apple, color: 'text-green-500' },
  { type: 'calories', target: 2000, unit: 'kcal', icon: Flame, color: 'text-orange-500' },
  { type: 'exercise', target: 30, unit: 'min', icon: Activity, color: 'text-purple-500' },
];

export default function Metrics({ currentTheme }: { currentTheme?: boolean }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);

  useEffect(() => {
    fetchEntries();
  }, [timeRange]);

  const fetchEntries = async () => {
    if (!supabase) {
      setError('Database service not configured');
      setLoading(false);
      return;
    }

    try {
      const endDate = new Date();
      const startDate = new Date();
      
      if (timeRange === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else {
        startDate.setMonth(endDate.getMonth() - 1);
      }

      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

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

  const getWeeklyData = (): WeeklyData[] => {
    const weeklyData: WeeklyData[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEntries = entries.filter(entry => 
        entry.created_at.startsWith(dateStr)
      );
      
      const dayData: WeeklyData = {
        date: dateStr,
        water: dayEntries.filter(e => e.type === 'water').reduce((sum, e) => sum + e.value, 0),
        protein: dayEntries.filter(e => e.type === 'protein').reduce((sum, e) => sum + e.value, 0),
        carbs: dayEntries.filter(e => e.type === 'carbs').reduce((sum, e) => sum + e.value, 0),
        calories: dayEntries.filter(e => e.type === 'calories').reduce((sum, e) => sum + e.value, 0),
        caffeine: dayEntries.filter(e => e.type === 'caffeine').reduce((sum, e) => sum + e.value, 0),
        exercise: dayEntries.filter(e => e.type === 'exercise').reduce((sum, e) => sum + e.value, 0),
      };
      
      weeklyData.push(dayData);
    }
    
    return weeklyData;
  };

  const getTotalForType = (type: string): number => {
    return entries.filter(entry => entry.type === type)
      .reduce((sum, entry) => sum + entry.value, 0);
  };

  const getAverageForType = (type: string): number => {
    const total = getTotalForType(type);
    const days = timeRange === 'week' ? 7 : 30;
    return total / days;
  };

  const getGoalProgress = (type: string): { percentage: number; current: number; target: number } => {
    const goal = goals.find(g => g.type === type);
    if (!goal) return { percentage: 0, current: 0, target: 0 };
    
    const current = getAverageForType(type);
    const percentage = Math.min((current / goal.target) * 100, 100);
    
    return { percentage, current, target: goal.target };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Metrics & Trends</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Month
            </button>
          </div>
        </div>
      </div>

      {/* Goal Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Goal Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const progress = getGoalProgress(goal.type);
            const Icon = goal.icon;
            
            return (
              <div key={goal.type} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <Icon className={`h-6 w-6 ${goal.color}`} />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white capitalize">{goal.type}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {progress.current.toFixed(1)} / {progress.target} {goal.unit}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress.percentage >= 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {progress.percentage.toFixed(1)}% complete
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Daily Trends</h3>
        <div className="space-y-4">
          {getWeeklyData().map((dayData) => (
            <div key={dayData.date} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                {formatDate(dayData.date)}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(dayData).filter(([key]) => key !== 'date').map(([type, value]) => {
                  const goal = goals.find(g => g.type === type);
                  if (!goal) return null;
                  
                  const Icon = goal.icon;
                  const isComplete = value >= goal.target;
                  
                  return (
                    <div key={type} className="text-center">
                      <Icon className={`h-5 w-5 mx-auto mb-1 ${goal.color}`} />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {value.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {goal.unit}
                      </p>
                      {isComplete && (
                        <div className="mt-1">
                          <Target className="h-3 w-3 mx-auto text-green-500" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {entries.length}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Entries</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-3">
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.ceil(entries.length / (timeRange === 'week' ? 7 : 30))}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Entries/Day</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-3">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              {new Set(entries.map(e => e.type)).size}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Categories</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="text-sm text-red-700 dark:text-red-300">{error}</div>
        </div>
      )}
    </div>
  );
}
