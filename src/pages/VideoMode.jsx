import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, PlayCircle, Plus, History, Trash2, Film } from 'lucide-react';
import { useVideo } from '../context/VideoContext';
import { chatWithGemini } from '../services/aiService';

export default function VideoMode() {
  const navigate = useNavigate();
  const { watchHistory, addToHistory, clearHistory, currentVideo, setCurrentVideo, clearCurrentVideo } = useVideo();
  
  const [urlInput, setUrlInput] = useState('');
  const [videoMetadata, setVideoMetadata] = useState(null);
  const [videoSummary, setVideoSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  // Extracts the 11-character YouTube video ID from various link formats (including /live/ and /shorts/)
  const extractYouTubeID = (url) => {
    const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=|live\/)([^#\&\?]{11}).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  const handleLoadVideo = async (e) => {
    e.preventDefault();
    const candidate = urlInput.trim();
    const videoId = extractYouTubeID(candidate);

    // Enforce classroom-related / educational content only with graceful confirmation
    const allowedKeys = ['study', 'lecture', 'tutorial', 'course', 'education', 'business', 'revision', 'management', 'strategy', 'finance', 'accounting', 'exam', 'quiz', 'class', 'training', 'coaching', '12th', 'cbse', 'jee', 'neet'];
    const deniedKeys = ['taarak', 'comedy', 'drama', 'song', 'movie', 'entertainment', 'gaming', 'music'];
    const lowerUrl = candidate.toLowerCase();

    const isDenied = deniedKeys.some((word) => lowerUrl.includes(word));
    const isAllowed = allowedKeys.some((word) => lowerUrl.includes(word));

    if (!videoId) {
      alert('Please enter a valid YouTube URL.');
      return;
    }

    if (isDenied) {
      alert('This content appears non-educational and is blocked by your policy settings.');
      return;
    }

    if (!isAllowed) {
      const explicitlyUse = window.confirm('This link does not match common educational keywords. Load anyway as a study resource?');
      if (!explicitlyUse) {
        return;
      }
    }

    const newVideo = {
      id: videoId,
      title: `Lecture Session: ${videoId}`,
      timestamp: new Date().toISOString()
    };
    setCurrentVideo(newVideo);
    addToHistory(newVideo);
    const metadata = await fetchYouTubeMetadata(videoId);
    if (metadata) {
      const updated = { ...newVideo, title: metadata.title };
      setCurrentVideo(updated);
      addToHistory(updated);
    }
    setUrlInput('');
  };

  const loadFromHistory = (video) => {
    setCurrentVideo(video);
    setVideoSummary('');
    setSummaryError('');
  };

  const fetchYouTubeMetadata = async (videoId) => {
    const ytKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!ytKey) {
      setVideoMetadata(null);
      return null;
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${ytKey}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('YouTube API request failed');

      const data = await response.json();
      const item = data.items?.[0];
      if (!item) throw new Error('Video metadata not found');

      const metadata = {
        title: item.snippet.title,
        description: item.snippet.description,
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: item.contentDetails?.duration,
        viewCount: item.statistics?.viewCount,
      };

      setVideoMetadata(metadata);
      return metadata;
    } catch (err) {
      console.warn('YouTube metadata error:', err);
      setVideoMetadata(null);
      return null;
    }
  };

  const analyzeCurrentVideo = async () => {
    if (!currentVideo) return;
    setSummaryLoading(true);
    setSummaryError('');

    try {
      const vidTitle = currentVideo.title || 'Unknown title';
      const vidDescription = videoMetadata?.description || 'No description available.';
      const prompt = `You are an educational assistant. A user is watching a video with these details:\n- Title: ${vidTitle}\n- Description: ${vidDescription}\n- YouTube ID: ${currentVideo.id}\nBased on this, infer the learning objectives, identify key concepts, explain what students should focus on, and suggest a study plan for this session.`;

      const response = await chatWithGemini({ prompt, mode: 'Study Assistant', language: 'English' });
      const summary = response?.text || 'No analysis available yet.';
      setVideoSummary(summary);
    } catch (err) {
      console.error('Video analysis error:', err);
      setSummaryError('Could not analyze video content. Try again later.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-6 lg:p-10 flex flex-col font-sans">
      
      {/* Top Nav */}
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-brand-muted hover:text-brand-primary transition-colors font-bold"
        >
          <ArrowLeft size={20} /> Exit Theater
        </button>
        <div className="flex items-center gap-2 bg-brand-card/50 px-4 py-2 rounded-full border border-brand-surface">
          <PlayCircle size={16} className="text-brand-primary" />
          <span className="text-xs font-black uppercase tracking-widest text-brand-text">Theater Mode Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        
        {/* MAIN VIEWING AREA */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Video Input */}
          <form onSubmit={handleLoadVideo} className="flex gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Paste YouTube Link to initialize sequence..." 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-brand-card border border-brand-surface p-4 rounded-2xl text-sm font-medium outline-none focus:border-brand-primary transition-all"
            />
            <button 
              type="submit"
              className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-brand-text hover:text-brand-bg transition-all shadow-[0_0_20px_var(--primary-color)] shadow-brand-primary/20"
            >
              <Plus size={16} /> Load Node
            </button>
          </form>

          {/* The Player */}
          <div className="relative flex-1 bg-black/40 rounded-[2.5rem] border border-brand-surface overflow-hidden min-h-[400px] shadow-2xl">
            {currentVideo ? (
              <iframe
                className="absolute inset-0 w-full h-full rounded-2xl"
                src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-muted/50">
                <Film size={80} className="mb-4 opacity-50" />
                <h2 className="text-xl font-black uppercase tracking-widest">Awaiting Video Link</h2>
                <p className="font-medium mt-2">Paste a URL above to begin.</p>
              </div>
            )}
          </div>

          {/* ANALYSIS PANEL */}
          <div className="mt-4 p-4 bg-brand-card/30 rounded-2xl border border-brand-surface">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-sm tracking-widest">AI Video Summary</h3>
              <button
                disabled={!currentVideo || summaryLoading}
                onClick={analyzeCurrentVideo}
                className="px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-bold disabled:opacity-60"
              >
                {summaryLoading ? 'Analyzing...' : 'Analyze' }
              </button>
            </div>
            {summaryError && <p className="text-red-400 text-sm mb-2">{summaryError}</p>}
            {videoSummary ? (
              <p className="text-sm leading-relaxed text-brand-text">{videoSummary}</p>
            ) : (
              <p className="text-sm text-brand-muted">Click Analyze to get an AI summary of this educational video.</p>
            )}
          </div>
        </div>

        {/* SIDEBAR: HISTORY */}
        <div className="bg-brand-card/30 border border-brand-surface rounded-[2.5rem] p-6 flex flex-col h-full max-h-[80vh]">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-brand-surface">
            <h3 className="text-xl font-black flex items-center gap-2">
              <History className="text-brand-primary" size={24} /> History Log
            </h3>
            <button onClick={clearHistory} className="text-brand-muted hover:text-red-500 transition-colors" title="Clear History">
              <Trash2 size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {watchHistory.length === 0 ? (
              <div className="text-center py-10 opacity-50">
                <p className="text-sm font-bold">No lectures logged.</p>
              </div>
            ) : (
              watchHistory.map((video, idx) => (
                <div 
                  key={idx}
                  onClick={() => loadFromHistory(video)}
                  className={`p-4 rounded-2xl cursor-pointer border transition-all ${currentVideo?.id === video.id ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-brand-bg border-transparent hover:border-brand-surface text-brand-text'}`}
                >
                  <p className="font-bold text-sm truncate">{video.title}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest mt-2 opacity-50">
                    {new Date(video.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}