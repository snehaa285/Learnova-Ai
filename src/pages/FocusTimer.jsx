import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ArrowLeft, BrainCircuit, Coffee, Wind, ShieldAlert, FastForward } from 'lucide-react';

// Import your custom Anti-Cheat Context
import { useTimer } from '../context/TimerContext';

// We map the keys to match exactly what you defined in the Context (focus, shortBreak, longBreak)
const MODE_ICONS = {
  focus: { icon: BrainCircuit, color: 'text-brand-primary', bg: 'bg-brand-primary', ring: 'stroke-brand-primary' },
  shortBreak: { icon: Coffee, color: 'text-emerald-500', bg: 'bg-emerald-500', ring: 'stroke-emerald-500' },
  longBreak: { icon: Wind, color: 'text-purple-500', bg: 'bg-purple-500', ring: 'stroke-purple-500' }
};

export default function FocusTimer() {
  const navigate = useNavigate();
  
  // Pulling ALL the powerful functions from your Context
  const { 
    timeLeft, 
    isActive, 
    toggleTimer, 
    resetTimer, 
    activeMode, 
    switchMode, 
    sessionCount, 
    MODES, 
    demoSkipTimer 
  } = useTimer();

  const [warningCount, setWarningCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    const warnings = [
      'First warning: Focus mode is active. Stay on this tab.',
      'Second warning: Distraction detected. Please return to focus.',
      'Third warning: Focus session will reset now.'
    ];

    const onDistracted = () => {
      if (!isActive || activeMode !== 'focus') return;

      setWarningCount((prev) => {
        const next = prev + 1;

        if (next >= 3) {
          setWarningMessage('Too many distractions. Focus session reset.');
          resetTimer();
          return 0;
        }

        setWarningMessage(warnings[next - 1]);
        return next;
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        onDistracted();
      }
    };

    const onBlur = () => {
      if (isActive && activeMode === 'focus') {
        onDistracted();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
    };
  }, [isActive, activeMode, resetTimer]);

  // Math for the display
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  
  // Math for the SVG Ring Animation
  const totalSeconds = MODES[activeMode]?.time || (25 * 60);
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const CurrentIcon = MODE_ICONS[activeMode]?.icon || BrainCircuit;
  const currentTheme = MODE_ICONS[activeMode] || MODE_ICONS.focus;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-6 flex flex-col font-sans overflow-hidden">
      
      {/* Top Nav & Stats */}
      <div className="flex justify-between items-center max-w-6xl mx-auto w-full mb-12">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-colors font-bold"
        >
          <ArrowLeft size={20} /> Back to HUD
        </button>
        
        <div className="flex items-center gap-4 bg-brand-card/50 backdrop-blur-md border border-brand-surface px-6 py-3 rounded-full shadow-lg">
          <ShieldAlert className={activeMode === 'focus' ? "text-red-500 animate-pulse" : "text-brand-muted"} size={18} />
          <span className="text-xs font-black uppercase tracking-widest text-brand-text">
            Anti-Cheat: {activeMode === 'focus' ? 'Active' : 'Standby'}
          </span>
          <div className="w-px h-4 bg-brand-surface mx-2"></div>
          <span className="text-xs font-black uppercase tracking-widest text-brand-muted">
            Sessions: <span className="text-brand-primary text-sm">{sessionCount}</span>
          </span>
        </div>
      </div>

      {warningMessage && (
        <div className="max-w-6xl mx-auto w-full mb-4 p-3 rounded-lg border border-red-400 bg-red-500/10 text-sm font-semibold text-red-300">
          <span className="font-bold">Anti-Cheat Alert:</span> {warningMessage} ({warningCount}/3)
        </div>
      )}

      {/* Main Timer Interface */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full relative z-10">
        
        {/* Mode Selectors */}
        <div className="flex gap-4 mb-12 bg-brand-card/80 backdrop-blur-xl border border-brand-surface p-2 rounded-[1.5rem] shadow-2xl">
          {Object.entries(MODES).map(([key, mode]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`px-6 py-4 rounded-xl font-black transition-all flex items-center gap-3 text-sm tracking-wide ${
                activeMode === key 
                ? `${MODE_ICONS[key].bg} text-white shadow-[0_0_20px_rgba(0,0,0,0.2)]` 
                : 'text-brand-muted hover:bg-brand-surface hover:text-brand-text'
              }`}
            >
              {React.createElement(MODE_ICONS[key].icon, { size: 18 })}
              {mode.name}
            </button>
          ))}
        </div>

        {/* The Clock Ring */}
        <motion.div 
          key={activeMode}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative w-80 h-80 md:w-96 md:h-96 flex items-center justify-center mb-12 group"
        >
          {/* Background Glow */}
          <div className={`absolute inset-0 ${currentTheme.bg} opacity-5 blur-[100px] rounded-full pointer-events-none transition-all duration-1000`}></div>

          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 filter drop-shadow-2xl">
            <circle 
              cx="50%" cy="50%" r="48%" 
              fill="none" stroke="var(--surface-color)" strokeWidth="4" className="opacity-30"
            />
            <circle 
              cx="50%" cy="50%" r="48%" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="12"
              strokeDasharray="300%"
              strokeDashoffset={`${300 - (progress * 3)}%`}
              className={`${currentTheme.color} transition-all duration-1000 ease-linear`}
              strokeLinecap="round"
            />
          </svg>

          {/* Time Display */}
          <div className="text-center z-10 flex flex-col items-center relative">
            <CurrentIcon size={40} className={`${currentTheme.color} mb-4 opacity-80`} />
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter tabular-nums text-brand-text drop-shadow-lg">
              {minutes}:{seconds}
            </h1>
            <p className="absolute -bottom-8 text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted">
              {MODES[activeMode]?.name}
            </p>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={resetTimer}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-card/50 border border-brand-surface text-brand-muted hover:text-brand-text hover:bg-brand-surface transition-all active:scale-95 shadow-lg"
          >
            <RotateCcw size={24} />
          </button>

          <button 
            onClick={toggleTimer}
            className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.2)] transition-all active:scale-95 ${
              isActive 
              ? 'bg-brand-card border-2 border-brand-surface text-brand-text' 
              : `${currentTheme.bg} text-white hover:brightness-110`
            }`}
          >
            {isActive ? <Pause size={36} /> : <Play size={36} className="ml-2" />}
          </button>
          
          {/* DEMO BUTTON: Hidden magic trick for the presentation */}
          <button 
            onClick={demoSkipTimer}
            title="Dev Mode: Skip to 3 seconds"
            className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-card/50 border border-brand-surface text-brand-muted hover:text-amber-500 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all active:scale-95 shadow-lg group"
          >
            <FastForward size={24} className="group-hover:animate-pulse" />
          </button>
        </div>

      </div>
    </div>
  );
}