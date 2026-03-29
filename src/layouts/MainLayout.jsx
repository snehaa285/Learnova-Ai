// File: src/layouts/MainLayout.jsx
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useVideo } from '../context/VideoContext';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, X } from 'lucide-react';

export default function MainLayout({ children }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { currentVideo, clearCurrentVideo } = useVideo();
  const location = useLocation();

  const isVideoModePath = location.pathname.includes('/video-mode') || location.pathname.includes('/video');
  const showFloatingPlayer = currentVideo && !isVideoModePath;

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* TOP NAVBAR */}
        <header className="h-16 flex items-center justify-between px-6 bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/50">
          <div className="text-slate-800 dark:text-white font-medium ml-10 md:ml-0">
            Dashboard
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#0b1120] p-4 md:p-6">
          {children}
        </main>

        {showFloatingPlayer && (
          <div
            className="fixed bottom-4 right-4 w-[340px] h-[192px] md:w-[420px] md:h-[240px] rounded-2xl border border-slate-700 shadow-2xl z-50 overflow-hidden"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}
          >
            <div className="absolute top-2 right-2 z-10">
              <button onClick={clearCurrentVideo} className="p-1 bg-black/60 rounded-full hover:bg-black/80 text-white">
                <X size={16} />
              </button>
            </div>
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${currentVideo.id}?autoplay=1`}
              title="Persistent YouTube Player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="absolute left-3 bottom-2 text-xs text-white/90 bg-black/40 px-2 py-1 rounded">
              {currentVideo.title}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}