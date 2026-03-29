import React, { createContext, useState, useContext, useEffect } from 'react';

const VideoContext = createContext();

export const VideoProvider = ({ children }) => {
  const [watchHistory, setWatchHistory] = useState(() => {
    const saved = localStorage.getItem('learnova_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentVideo, setCurrentVideo] = useState(() => {
    const saved = localStorage.getItem('learnova_current_video');
    return saved ? JSON.parse(saved) : null;
  });

  // Save to local storage whenever history changes
  useEffect(() => {
    localStorage.setItem('learnova_history', JSON.stringify(watchHistory));
  }, [watchHistory]);

  // Save the current playing video as persistence
  useEffect(() => {
    if (currentVideo) {
      localStorage.setItem('learnova_current_video', JSON.stringify(currentVideo));
    } else {
      localStorage.removeItem('learnova_current_video');
    }
  }, [currentVideo]);

  const addToHistory = (video) => {
    setWatchHistory(prev => {
      // Prevent duplicates in history
      if (prev.find(v => v.id === video.id)) return prev;
      return [video, ...prev];
    });
  };

  const clearHistory = () => setWatchHistory([]);
  const clearCurrentVideo = () => setCurrentVideo(null);

  return (
    <VideoContext.Provider value={{ watchHistory, addToHistory, clearHistory, currentVideo, setCurrentVideo, clearCurrentVideo }}>
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => useContext(VideoContext);