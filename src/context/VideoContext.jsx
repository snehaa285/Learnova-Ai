import React, { createContext, useState, useContext, useEffect } from 'react';

const VideoContext = createContext(null); // Initialize with null to detect missing Provider

export const VideoProvider = ({ children }) => {
  const [watchHistory, setWatchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('learnova_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [currentVideo, setCurrentVideo] = useState(() => {
    try {
      const saved = localStorage.getItem('learnova_current_video');
      // 🛡️ CRITICAL FIX: Ensure we return null if the data is corrupt or missing
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  useEffect(() => {
    localStorage.setItem('learnova_history', JSON.stringify(watchHistory));
  }, [watchHistory]);

  useEffect(() => {
    if (currentVideo) {
      localStorage.setItem('learnova_current_video', JSON.stringify(currentVideo));
    } else {
      localStorage.removeItem('learnova_current_video');
    }
  }, [currentVideo]);

  const addToHistory = (video) => {
    if (!video) return;
    setWatchHistory(prev => {
      if (prev.find(v => v.id === video.id)) return prev;
      return [video, ...prev];
    });
  };

  const clearHistory = () => setWatchHistory([]);
  const clearCurrentVideo = () => setCurrentVideo(null);

  // 🛡️ Always provide a fallback value
  const value = {
    watchHistory: watchHistory || [],
    currentVideo: currentVideo || null,
    addToHistory,
    clearHistory,
    setCurrentVideo,
    clearCurrentVideo
  };

  return (
    <VideoContext.Provider value={value}>
      {children}
    </VideoContext.Provider>
  );
};

// 🛡️ SAFETY HOOK: This prevents the "undefined" crash
export const useVideo = () => {
  const context = useContext(VideoContext);
  if (context === undefined || context === null) {
    return {
      watchHistory: [],
      currentVideo: null,
      addToHistory: () => {},
      clearHistory: () => {},
      setCurrentVideo: () => {},
      clearCurrentVideo: () => {}
    };
  }
  return context;
};