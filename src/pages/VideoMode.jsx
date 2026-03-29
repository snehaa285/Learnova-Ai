import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, PlayCircle, Plus, History, Trash2, Film, Loader2 } from 'lucide-react';
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

  // 🛡️ SAFETY CHECK: Reset metadata when currentVideo changes
  useEffect(() => {
    if (!currentVideo) {
      setVideoMetadata(null);
      setVideoSummary('');
    }
  }, [currentVideo]);

  const extractYouTubeID = (url) => {
    const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=|live\/)([^#\&\?]{11}).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  };

  const handleLoadVideo = async (e) => {
    e.preventDefault();
    const candidate = urlInput.trim();
    const videoId = extractYouTubeID(candidate);

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
      if (!explicitlyUse) return;
    }

    const newVideo = {
      id: videoId,
      title: `Lecture Session: ${videoId}`,
      timestamp: new Date().toISOString()
    };

    setCurrentVideo(newVideo);
    addToHistory(newVideo);
    
    // Fetch and update title
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
    if (!ytKey) return null;

    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&key=${ytKey}`;
      const response = await fetch(url);
      const data = await response.json();
      const item = data.items?.[0];
      
      if (!item) return null;

      const metadata = {
        title: item.snippet.title,
        description: item.snippet.description,
        channel: item.snippet.channelTitle,
      };

      setVideoMetadata(metadata);
      return metadata;
    } catch (err) {
      console.warn('YouTube metadata error:', err);
      return null;
    }
  };

  const analyzeCurrentVideo = async () => {
    if (!currentVideo) return;
    setSummaryLoading(true);
    setSummaryError('');

    try {
      // 🛡️ SAFETY CHECK: Optional chaining prevents destructuring errors
      const vidTitle = currentVideo.title || 'Educational Session';
      const vidDescription = videoMetadata?.description || 'Context-based learning session.';
      
      const prompt = `You are an educational assistant. Summarize this video:\n- Title: ${vidTitle}\n- Description: ${vidDescription.substring(0, 500)}...`;

      const response = await chatWithGemini({ prompt, mode: 'Study Assistant', language: 'English' });
      setVideoSummary(response?.text || 'Analysis complete. Ready for notes.');
    } catch (err) {
      setSummaryError('Analysis failed. Please try again.');
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
          <span className="text-xs font-black uppercase tracking-widest">Theater Mode Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        <div className="lg:col-span-2 flex flex-col">
          <form onSubmit={handleLoadVideo} className="flex gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Paste YouTube Link..." 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-brand-card border border-brand-surface p-4 rounded-2xl text-sm outline-none focus:border-brand-primary transition-all"
            />
            <button 
              type="submit"
              className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-lg shadow-brand-primary/20"
            >
              <Plus size={16} className="inline mr-2" /> Load Node
            </button>
          </form>

          <div className="relative flex-1 bg-black/40 rounded-[2.5rem] border border-brand-surface overflow-hidden min-h-[400px]">
            {currentVideo ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-50">
                <Film size={80} className="mb-4" />
                <h2 className="text-xl font-black uppercase tracking-widest">Awaiting Link</h2>
              </div>
            )}
          </div>

          {/* Analysis Panel */}
          <div className="mt-4 p-4 bg-brand-card/30 rounded-2xl border border-brand-surface">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-sm tracking-widest">AI Video Summary</h3>
              <button
                disabled={!currentVideo || summaryLoading}
                onClick={analyzeCurrentVideo}
                className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-2"
              >
                {summaryLoading && <Loader2 size={14} className="animate-spin" />}
                {summaryLoading ? 'Processing...' : 'Analyze Session'}
              </button>
            </div>
            {summaryError && <p className="text-red-400 text-xs mb-2">{summaryError}</p>}
            <p className="text-sm leading-relaxed text-brand-muted">
              {videoSummary || "Press analyze to generate a session summary."}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-brand-card/30 border border-brand-surface rounded-[2.5rem] p-6 flex flex-col h-full max-h-[80vh]">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-brand-surface">
            <h3 className="text-xl font-black flex items-center gap-2">
              <History className="text-brand-primary" size={24} /> History Log
            </h3>
            <button onClick={clearHistory} className="text-brand-muted hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {watchHistory.length === 0 ? (
              <p className="text-center py-10 opacity-50 text-xs font-bold uppercase">No logs</p>
            ) : (
              watchHistory.map((video, idx) => (
                <button 
                  key={idx}
                  onClick={() => loadFromHistory(video)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${currentVideo?.id === video.id ? 'bg-brand-primary/10 border-brand-primary text-brand-primary' : 'bg-brand-bg border-transparent hover:border-brand-surface text-brand-text'}`}
                >
                  <p className="font-bold text-sm truncate">{video.title}</p>
                  <p className="text-[9px] font-black uppercase tracking-tighter opacity-50 mt-1">
                    {new Date(video.timestamp).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}