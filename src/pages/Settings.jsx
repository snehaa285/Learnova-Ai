// File: src/pages/Settings.jsx
import { useContext, useEffect, useState } from 'react';
import { User, Bell, Monitor, Mail, LogOut, Globe, Check } from 'lucide-react';
import { ThemeContext } from '../context/ThemeContext';

const DEFAULT_USER = {
  name: 'Guest User',
  email: 'guest@learnova.ai',
  fullName: 'Guest User',
  role: 'Student Account',
  language: 'English',
};

const readBool = (key, fallback) => {
  const value = localStorage.getItem(key);
  if (value === null) return fallback;
  return value === 'true';
};

export default function Settings() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [user, setUser] = useState(DEFAULT_USER);
  const [draftUser, setDraftUser] = useState(DEFAULT_USER);
  const [preferences, setPreferences] = useState({
    studyReminders: true,
    taskDeadlines: true,
    aiInsights: true,
    compactView: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const mergedUser =
        storedUser && Object.keys(storedUser).length > 0
          ? { ...DEFAULT_USER, ...storedUser }
          : DEFAULT_USER;

      setUser(mergedUser);
      setDraftUser(mergedUser);
      setPreferences({
        studyReminders: readBool('study_reminders', true),
        taskDeadlines: readBool('task_deadlines', true),
        aiInsights: readBool('ai_insights', true),
        compactView: readBool('compact_view', false),
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      setUser(DEFAULT_USER);
      setDraftUser(DEFAULT_USER);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!saveMessage) return undefined;

    const timeoutId = window.setTimeout(() => setSaveMessage(''), 2500);
    return () => window.clearTimeout(timeoutId);
  }, [saveMessage]);

  const persistPreference = (key, value) => {
    localStorage.setItem(key, String(value));
  };

  const handlePreferenceToggle = (key, storageKey) => {
    setPreferences((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      persistPreference(storageKey, next[key]);
      return next;
    });
  };

  const handleThemeToggle = () => {
    toggleTheme();
    setSaveMessage(`Theme updated to ${theme === 'dark' ? 'light' : 'dark'} mode.`);
  };

  const handleDraftChange = (field, value) => {
    setDraftUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleProfileSave = () => {
    const normalizedUser = {
      ...user,
      ...draftUser,
      name: draftUser.name.trim() || draftUser.fullName.trim() || DEFAULT_USER.name,
      fullName: draftUser.fullName.trim() || draftUser.name.trim() || DEFAULT_USER.fullName,
      email: draftUser.email.trim() || DEFAULT_USER.email,
      language: draftUser.language.trim() || DEFAULT_USER.language,
    };

    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
    setDraftUser(normalizedUser);
    setIsEditing(false);
    setSaveMessage('Profile saved successfully.');
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setDraftUser(user);
      setIsEditing(false);
      return;
    }

    setDraftUser(user);
    setIsEditing(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  const getInitials = (name) => {
    if (!name) return 'GU';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="text-center py-12 text-slate-600 dark:text-slate-300">Loading settings...</div>
      </div>
    );
  }

  const activeUser = isEditing ? draftUser : user;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your profile, notifications, and workspace behavior.
          </p>
        </div>
        {saveMessage ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Check size={16} />
            {saveMessage}
          </div>
        ) : null}
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
            {getInitials(activeUser.name || activeUser.fullName)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              {activeUser.name || activeUser.fullName || 'User'}
            </h3>
            <p className="text-sm text-slate-500">{activeUser.email || 'No email provided'}</p>
          </div>
          <div className="md:ml-auto flex gap-3">
            <button
              onClick={handleEditToggle}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            {isEditing ? (
              <button
                onClick={handleProfileSave}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
              >
                Save Changes
              </button>
            ) : null}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
              <input
                type="text"
                value={draftUser.name}
                onChange={(e) => handleDraftChange('name', e.target.value)}
                disabled={!isEditing}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 disabled:opacity-70"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                value={draftUser.fullName}
                onChange={(e) => handleDraftChange('fullName', e.target.value)}
                disabled={!isEditing}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-200 disabled:opacity-70"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  value={draftUser.email}
                  onChange={(e) => handleDraftChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="w-full bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none disabled:opacity-70"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Type</label>
              <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                <User size={18} className="text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-300">
                  {user.role || DEFAULT_USER.role}
                </span>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Preferred Language</label>
              <div className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                <Globe size={18} className="text-slate-400" />
                <input
                  type="text"
                  value={draftUser.language}
                  onChange={(e) => handleDraftChange('language', e.target.value)}
                  disabled={!isEditing}
                  className="w-full bg-transparent text-sm text-slate-600 dark:text-slate-300 outline-none disabled:opacity-70"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Bell size={18} /> Notifications
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600 dark:text-slate-300">Study Reminders</span>
              <input
                type="checkbox"
                checked={preferences.studyReminders}
                onChange={() => handlePreferenceToggle('studyReminders', 'study_reminders')}
                className="w-4 h-4 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600 dark:text-slate-300">Task Deadlines</span>
              <input
                type="checkbox"
                checked={preferences.taskDeadlines}
                onChange={() => handlePreferenceToggle('taskDeadlines', 'task_deadlines')}
                className="w-4 h-4 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600 dark:text-slate-300">AI Insights</span>
              <input
                type="checkbox"
                checked={preferences.aiInsights}
                onChange={() => handlePreferenceToggle('aiInsights', 'ai_insights')}
                className="w-4 h-4 accent-primary"
              />
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Monitor size={18} /> Appearance
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600 dark:text-slate-300">Dark Mode</span>
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={handleThemeToggle}
                className="w-4 h-4 accent-primary"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-600 dark:text-slate-300">Compact View</span>
              <input
                type="checkbox"
                checked={preferences.compactView}
                onChange={() => handlePreferenceToggle('compactView', 'compact_view')}
                className="w-4 h-4 accent-primary"
              />
            </label>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors mt-6"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
