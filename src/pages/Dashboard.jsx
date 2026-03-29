import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, ShieldCheck, PlayCircle, Timer, 
  Calendar, FileText, BarChart3, Settings, LogOut,
  LayoutDashboard, MessageSquare, BookOpen, ClipboardCheck,
  Zap, Crosshair, FolderKanban, Activity, Terminal
} from 'lucide-react';

// 🛡️ Bulletproofed Context Access
import { useVideo } from '../context/VideoContext';
import { useTimer } from '../context/TimerContext';

// 🚀 Database Services
import { fetchTasks } from '../services/taskService';
import { fetchNotes } from '../services/noteService';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- REAL-TIME DATA STATES ---
  const [user, setUser] = useState({ name: 'Operative' });
  const [vaultFiles, setVaultFiles] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // 🛡️ SAFE CONTEXT DESTRUCTURING
  // We use default values (watchHistory = []) in case the context is still loading
  const { watchHistory = [] } = useVideo() || {};
  const { sessionCount = 0 } = useTimer() || {};

  useEffect(() => {
    // 1. Load actual user data from login
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser({ name: parsedUser.name || parsedUser.fullName || 'Operative' });
      } catch (e) {
        setUser({ name: savedUser });
      }
    }

    // 2. Fetch LIVE data from Database
    const syncDatabase = async () => {
      try {
        const [notesData, tasksData] = await Promise.all([
          fetchNotes(),
          fetchTasks()
        ]);
        
        setVaultFiles(Array.isArray(notesData) ? notesData : []);
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      } catch (error) {
        console.error("🔥 HUD Sync Error: Database unreachable");
      }
    };

    syncDatabase();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  // --- ANIMATION CONFIG ---
  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, scale: 0.95, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 20 } } };

  const navLinks = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', active: true },
    { title: 'AI Assistant', icon: <MessageSquare size={20} />, path: '/chatbot' },
    { title: 'Study Vault', icon: <BookOpen size={20} />, path: '/vault' },
    { title: 'Mock Tests', icon: <ClipboardCheck size={20} />, path: '/mock-tests' },
    { title: 'Focus Timer', icon: <Timer size={20} />, path: '/focus' },
    { title: 'Study Planner', icon: <Calendar size={20} />, path: '/planner' },
    { title: 'Video Mode', icon: <PlayCircle size={20} />, path: '/video-mode' },
    { title: 'Cybersecurity', icon: <ShieldCheck size={20} />, path: '/cybersecurity' },
    { title: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics' },
  ];

  return (
    <div className="min-h-full flex bg-brand-bg text-brand-text font-sans transition-colors duration-500 overflow-hidden selection:bg-brand-primary/30">
      
      {/* HUD Effects */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,var(--surface-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--surface-color)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.03] pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[50vh] bg-brand-primary/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-transparent flex flex-col min-h-full z-40 p-4 lg:p-6 transition-all">
        <div className="flex-1 bg-brand-card/40 backdrop-blur-2xl border border-brand-surface rounded-[2rem] flex flex-col overflow-hidden shadow-2xl">
          <div className="p-6 flex justify-center lg:justify-start items-center gap-3 border-b border-brand-surface/50">
            <div className="bg-brand-primary p-2.5 rounded-2xl shadow-lg shadow-brand-primary/30">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <span className="hidden lg:block text-2xl font-black tracking-tighter text-brand-text">Learnova</span>
          </div>
          
          <nav className="flex-1 px-3 space-y-2 overflow-y-auto mt-6 pb-6 hide-scrollbar">
            {navLinks.map((link, i) => (
              <button 
                key={i} onClick={() => navigate(link.path)}
                className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group font-bold ${
                  link.active 
                    ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20' 
                    : 'text-brand-muted hover:bg-brand-surface hover:text-brand-text'
                }`}
              >
                <span>{link.icon}</span>
                <span className="hidden lg:block">{link.title}</span>
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-brand-surface/50 space-y-2 bg-brand-card/20">
            <button onClick={() => navigate('/settings')} className="w-full flex justify-center lg:justify-start items-center gap-3 px-4 py-3 text-brand-muted hover:text-brand-text hover:bg-brand-surface rounded-xl transition-all font-bold">
              <Settings size={20} /> <span className="hidden lg:block">Settings</span>
            </button>
            <button onClick={handleLogout} className="w-full flex justify-center lg:justify-start items-center gap-3 px-4 py-3 text-brand-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold group">
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> <span className="hidden lg:block">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-h-full scroll-smooth relative p-6 lg:py-10 lg:pr-10 lg:pl-4">
        <div className="max-w-7xl mx-auto relative z-10 pb-20">
          
          <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-brand-surface pb-6">
            <div>
              <p className="text-brand-primary font-black tracking-widest uppercase text-xs mb-3 flex items-center gap-2">
                <Terminal size={14} /> Cognitive Acceleration Engine
              </p>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-brand-text leading-none">
                Welcome, <span className="text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text">{user.name}</span>.
              </h1>
            </div>
            <div className="flex items-center gap-3 bg-brand-card/50 backdrop-blur-md border border-brand-surface px-4 py-2 rounded-full">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black text-brand-text uppercase tracking-widest">Neural Sync: Optimal</span>
            </div>
          </header>

          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-12 gap-6">

            {/* AI COMMAND CENTER */}
            <motion.div variants={item} className="md:col-span-12 bg-brand-card/40 backdrop-blur-2xl border border-brand-primary/30 p-8 lg:p-10 rounded-[2.5rem] relative overflow-hidden group">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="text-brand-primary animate-pulse" size={24} />
                    <h2 className="text-2xl font-black text-brand-text tracking-tight">AI Command Override</h2>
                  </div>
                  <p className="text-brand-muted font-medium max-w-2xl text-lg leading-relaxed">
                    Deploy the AI Assistant to synthesize documents, construct study pipelines, or analyze logic gaps in real-time.
                  </p>
                </div>
                <button 
                  onClick={() => navigate('/chatbot')}
                  className="w-full md:w-auto px-10 py-5 bg-brand-primary hover:bg-brand-text text-white hover:text-brand-bg font-black rounded-2xl transition-all shadow-lg shadow-brand-primary/20 uppercase tracking-widest text-sm"
                >
                  Engage AI Core
                </button>
              </div>
            </motion.div>

            {/* FOCUS TELEMETRY */}
            <motion.div variants={item} className="md:col-span-4 bg-brand-bg/50 backdrop-blur-md border border-brand-surface p-8 rounded-[2.5rem] flex flex-col">
              <h3 className="font-black text-brand-text flex items-center gap-2 mb-8">
                <Crosshair className="text-brand-primary" size={20} /> Focus Telemetry
              </h3>
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <span className="text-7xl font-black text-brand-text tracking-tighter">{sessionCount}</span>
                <span className="text-xs font-black text-brand-muted uppercase tracking-widest mt-2">Completed Sessions</span>
              </div>
              <button onClick={() => navigate('/focus')} className="w-full mt-8 py-4 bg-brand-primary/10 text-brand-primary font-bold rounded-xl transition-all">
                Access Focus Drive
              </button>
            </motion.div>

            {/* THEATER TELEMETRY */}
            <motion.div variants={item} className="md:col-span-4 bg-brand-bg/50 backdrop-blur-md border border-brand-surface p-8 rounded-[2.5rem] flex flex-col">
              <h3 className="font-black text-brand-text flex items-center gap-2 mb-8">
                <PlayCircle className="text-brand-primary" size={20} /> Theater Data
              </h3>
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <span className="text-7xl font-black text-brand-text tracking-tighter">{watchHistory.length}</span>
                <span className="text-xs font-black text-brand-muted uppercase tracking-widest mt-2">Lectures Mastered</span>
              </div>
              <button onClick={() => navigate('/video-mode')} className="w-full mt-8 py-4 bg-brand-primary/10 text-brand-primary font-bold rounded-xl transition-all">
                Access Video Mode
              </button>
            </motion.div>

            {/* SECURITY HEALTH */}
            <motion.div variants={item} onClick={() => navigate('/cybersecurity')} className="md:col-span-4 bg-emerald-500/5 backdrop-blur-md border border-emerald-500/20 p-8 rounded-[2.5rem] flex flex-col justify-center items-center text-center cursor-pointer group hover:bg-emerald-500/10 transition-colors">
               <ShieldCheck size={64} className="text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
               <h3 className="text-2xl font-black text-brand-text">Defense Grid Active</h3>
               <p className="text-emerald-500/80 font-bold text-sm mt-2">Neural Link Secure.</p>
            </motion.div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}