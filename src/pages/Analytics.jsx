// File: src/pages/Analytics.jsx
import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Target, Award,
  BookOpen, Clock, Zap, BrainCircuit
} from 'lucide-react';
import { fetchTasks } from '../services/taskService';
import { useTimer } from '../context/TimerContext';
import { useVideo } from '../context/VideoContext';

export default function Analytics() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const timerContext = useTimer() || {};
  const videoContext = useVideo() || {};
  const sessionCount = timerContext.sessionCount || 0;
  const watchHistory = videoContext.watchHistory || [];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const tasksData = await fetchTasks();
        setTasks(tasksData);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate real analytics from user data
  const totalStudyHours = Math.round((sessionCount * 25) / 60 * 10) / 10; // Assuming 25 min sessions
  const focusScore = sessionCount > 0 ? Math.min(100, Math.round((sessionCount / 30) * 100)) : 0;
  const currentStreak = sessionCount; // Simplified - could be enhanced with date tracking
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Generate weekly study data based on session count
  const generateWeeklyData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baseHours = totalStudyHours / 7;

    return days.map((day, index) => {
      // Simulate some variation in daily study hours
      const variation = (Math.sin(index * 0.5) + 1) * 0.5; // Creates a wave pattern
      const hours = Math.max(0, Math.round((baseHours * (0.5 + variation)) * 10) / 10);
      const percentage = Math.min(100, Math.round((hours / 8) * 100)); // Max 8 hours per day

      return {
        day,
        hours,
        percentage: `${percentage}%`
      };
    });
  };

  // Calculate subject mastery based on task types
  const calculateSubjectMastery = () => {
    const typeCounts = {};
    const completedByType = {};

    tasks.forEach(task => {
      const type = task.type || 'Other';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      if (task.completed) {
        completedByType[type] = (completedByType[type] || 0) + 1;
      }
    });

    return Object.entries(typeCounts).map(([type, total]) => {
      const completed = completedByType[type] || 0;
      const score = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Color based on performance
      let color = 'bg-emerald-500';
      if (score < 30) color = 'bg-red-500';
      else if (score < 70) color = 'bg-yellow-500';
      else if (score < 90) color = 'bg-blue-500';

      return {
        name: type,
        score,
        color
      };
    }).sort((a, b) => b.score - a.score).slice(0, 4); // Top 4 subjects
  };

  const weeklyData = generateWeeklyData();
  const subjectMastery = calculateSubjectMastery();

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="text-center py-12">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Performance Analytics <TrendingUp className="text-primary dark:text-accent" size={24} />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Track your learning velocity and subject mastery.</p>
        </div>
        <button className="px-4 py-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700/50 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Download Report
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* 2. TOP STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Study Hours</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalStudyHours}h</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-lg">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Focus Score</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{focusScore}%</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Current Streak</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{currentStreak} Days</p>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg">
            <BrainCircuit size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Task Completion</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{taskCompletionRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 3. WEEKLY STUDY HOURS CHART (Takes up 2/3 width) */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Study Velocity (This Week)</h2>
            <select className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm rounded-lg px-3 py-1.5 text-slate-600 dark:text-slate-300 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>

          {/* Custom CSS Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 relative">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-full border-b border-slate-100 dark:border-slate-800/50 flex-1"></div>
              ))}
            </div>

            {/* Bars */}
            {weeklyData.map((data) => (
              <div key={data.day} className="flex flex-col items-center flex-1 z-10 group">
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity mb-2 bg-slate-800 text-white text-xs py-1 px-2 rounded absolute -mt-8 pointer-events-none">
                  {data.hours}h
                </div>
                {/* The actual Bar */}
                <div
                  className="w-full max-w-[40px] bg-primary/20 dark:bg-primary/30 rounded-t-md relative overflow-hidden transition-all duration-500 group-hover:bg-primary/30 dark:group-hover:bg-primary/50"
                  style={{ height: data.percentage }}
                >
                  <div className="absolute bottom-0 w-full bg-primary rounded-t-md transition-all duration-1000" style={{ height: '100%' }}></div>
                </div>
                {/* X-Axis Label */}
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">{data.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. SUBJECT MASTERY ANALYSIS */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Subject Mastery</h2>

          {subjectMastery.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p className="text-sm">Complete tasks to see subject mastery</p>
            </div>
          ) : (
            <div className="space-y-6">
              {subjectMastery.map((subject) => (
                <div key={subject.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{subject.name}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{subject.score}%</span>
                  </div>
                  {/* Progress Bar Track */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                    {/* Progress Bar Fill */}
                    <div
                      className={`h-2.5 rounded-full ${subject.color} transition-all duration-1000`}
                      style={{ width: `${subject.score}%` }}
                    ></div>
                  </div>
                  {/* Smart Warning Text */}
                  {subject.score < 50 && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <Target size={12} /> Needs attention
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}