// File: src/components/Sidebar.jsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Bot, FolderOpen, Video, 
  Timer, FileText, CalendarDays, BarChart3, 
  UserCircle, Settings, Menu, X, ShieldCheck 
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'AI Chatbot', icon: Bot, path: '/chatbot' },
  { name: 'Study Vault', icon: FolderOpen, path: '/vault' },
  { name: 'Video Mode', icon: Video, path: '/video' },
  { name: 'Focus Timer', icon: Timer, path: '/focus' },
  { name: 'Mock Tests', icon: FileText, path: '/tests' },
  { name: 'Planner', icon: CalendarDays, path: '/planner' },
  { name: 'Analytics', icon: BarChart3, path: '/analytics' },
  { name: 'Cybersecurity', icon: ShieldCheck, path: '/cybersecurity' },
];

const bottomItems = [
  { name: 'Profile', icon: UserCircle, path: '/settings' },
  { name: 'Settings', icon: Settings, path: '/settings' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 shadow-md border border-slate-200 dark:border-slate-700"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-white dark:bg-dark-card border-r border-slate-200 dark:border-slate-700/50 
        transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700/50">
          <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
            LEARNOVA<span className="text-slate-800 dark:text-white">.AI</span>
          </h1>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `
                w-full flex items-center px-3 py-2.5 rounded-xl transition-all group
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }
              `}
            >
              <item.icon className={`mr-3 h-5 w-5 transition-transform group-hover:scale-110`} />
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-700/50 space-y-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center px-3 py-2.5 rounded-xl transition-all
                ${isActive 
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }
              `}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}