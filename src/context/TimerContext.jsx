import React, { createContext, useState, useContext, useEffect } from 'react';

const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  // Timer modes configuration
  const MODES = {
    focus: { name: 'Focus Session', time: 25 * 60 },        // 25 minutes
    shortBreak: { name: 'Short Break', time: 5 * 60 },      // 5 minutes
    longBreak: { name: 'Long Break', time: 15 * 60 }        // 15 minutes
  };

  // Load initial count from local storage
  const [sessionCount, setSessionCount] = useState(() => {
    const saved = localStorage.getItem('learnova_sessions');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [activeMode, setActiveMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.time);
  const [isActive, setIsActive] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Auto-switch mode when timer ends
      setIsActive(false);
      if (activeMode === 'focus') {
        addSession();
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, activeMode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[activeMode].time);
  };

  const switchMode = (mode) => {
    setIsActive(false);
    setActiveMode(mode);
    setTimeLeft(MODES[mode].time);
  };

  const addSession = () => {
    setSessionCount(prev => {
      const newCount = prev + 1;
      localStorage.setItem('learnova_sessions', newCount);
      return newCount;
    });
  };

  // Demo feature to skip timer (useful for testing)
  const demoSkipTimer = () => {
    setTimeLeft(0);
  };

  return (
    <TimerContext.Provider value={{ 
      sessionCount, 
      addSession,
      timeLeft,
      isActive,
      toggleTimer,
      resetTimer,
      activeMode,
      switchMode,
      MODES,
      demoSkipTimer
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);