// File: src/pages/Chatbot.jsx
import { useState, useEffect } from 'react';
import { 
  Send, Mic, Paperclip, Bot, User, 
  GraduationCap, Briefcase, Search, Globe, Save 
} from 'lucide-react';
import { chatWithGemini } from '../services/aiService';
import { saveNote as saveNoteAPI } from '../services/noteService';

export default function Chatbot() {
  const [activeMode, setActiveMode] = useState('Study Assistant');
  const [activeLanguage, setActiveLanguage] = useState('English');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([{ id: 1, sender: 'ai', text: 'Hello! I am your LEARNOVA AI assistant. How can I help you with your studies today?' }]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('learnova_chat_history') || '[]');
    if (Array.isArray(stored)) {
      setHistory(stored);
      if (stored.length > 0) {
        setMessages(stored.slice(-20));
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('learnova_chat_history', JSON.stringify(history));
  }, [history]);

  const modes = [
    { name: 'Study Assistant', icon: GraduationCap, color: 'text-primary' },
    { name: 'Career Counselor', icon: Briefcase, color: 'text-secondary' },
    { name: 'Research Mode', icon: Search, color: 'text-accent' },
  ];

  const languages = ['English', 'Hindi', 'Bengali', 'Punjabi', 'Telugu'];

  const saveToHistory = (message) => {
    const newHistory = [...history, message];
    setHistory(newHistory);
    localStorage.setItem('learnova_chat_history', JSON.stringify(newHistory));
  };

  const saveNote = async (text) => {
    const notePayload = {
      title: `AI note - ${new Date().toLocaleString()}`,
      content: text,
      category: 'AI Assistant',
    };

    try {
      await saveNoteAPI(notePayload);
      setError('Note saved to vault successfully.');
      setTimeout(() => setError(''), 1800);
    } catch (err) {
      console.error('💥 saveNote error:', err);
      setError('Failed to save note to backend vault.');
      setTimeout(() => setError(''), 1800);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = { id: Date.now(), sender: 'user', text: inputMessage };
    setMessages((prev) => [...prev, userMessage]);
    saveToHistory(userMessage);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      const context = activeMode === 'Study Assistant' ? 'You are a study assistant' : activeMode === 'Career Counselor' ? 'You are a career counselor' : 'You are a research assistant';
      const prompt = `${context}. Answer the user in ${activeLanguage}. User question: ${inputMessage}`;
      const aiResponse = await chatWithGemini({ prompt, mode: activeMode, language: activeLanguage });
      const text = aiResponse?.text || aiResponse?.raw?.answer || aiResponse?.raw?.output_text || aiResponse?.raw?.output?.[0]?.content || aiResponse?.raw?.candidates?.[0]?.content || 'No response available.';
      const aiMessage = { id: Date.now() + 1, sender: 'ai', text };
      setMessages((prev) => [...prev, aiMessage]);
      saveToHistory(aiMessage);
    } catch (err) {
      console.error('Chatbot error:', err);
      setError('AI error: ' + (err.message || 'Please check your API key and backend connection.'));
      const aiMessage = { id: Date.now() + 1, sender: 'ai', text: 'Failed to generate response. Please try again.' };
      setMessages((prev) => [...prev, aiMessage]);
      saveToHistory(aiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-light-card dark:bg-dark-card rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden animate-in fade-in duration-500">
      
      {/* 1. CHAT HEADER & MODE SWITCHER */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex flex-wrap gap-2 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-lg w-fit">
          {modes.map((mode) => (
            <button
              key={mode.name}
              onClick={() => setActiveMode(mode.name)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeMode === mode.name 
                  ? 'bg-white dark:bg-dark-card shadow-sm text-slate-800 dark:text-white' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <mode.icon size={16} className={activeMode === mode.name ? mode.color : ''} />
              <span className="hidden sm:inline">{mode.name}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-slate-300" />
          <select
            value={activeLanguage}
            onChange={(e) => setActiveLanguage(e.target.value)}
            className="text-sm p-2 rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
            style={{ minWidth: '140px' }}
          >
            {languages.map((lang) => (
              <option key={lang} value={lang} className="bg-slate-900 text-white">
                {lang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-[#0b1120]/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] md:max-w-[70%] space-x-3 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0">
                {msg.sender === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <User size={18} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                    <Bot size={18} />
                  </div>
                )}
              </div>
              <div className={`p-4 rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-primary text-white rounded-tr-sm' 
                  : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700/50 text-slate-700 dark:text-slate-200 rounded-tl-sm shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                {msg.sender === 'ai' && (
                  <button onClick={() => saveNote(msg.text)} className="mt-2 text-xs text-indigo-600 dark:text-indigo-300 hover:underline flex items-center gap-1">
                    <Save size={14} /> Save as note
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. INPUT AREA */}
      <div className="p-4 bg-white dark:bg-dark-card border-t border-slate-200 dark:border-slate-700/50">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <button type="button" className="p-2 text-slate-400 hover:text-primary dark:hover:text-accent transition-colors">
            <Paperclip size={20} />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask ${activeMode}...`}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-primary/50 dark:focus:border-accent/50 rounded-full px-4 py-3 text-sm outline-none transition-all text-slate-800 dark:text-white placeholder-slate-400"
            />
            <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-secondary dark:hover:text-secondary transition-colors">
              <Mic size={18} />
            </button>
          </div>
          <button 
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-3 bg-primary hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-full transition-colors flex items-center justify-center"
          >
            <Send size={18} className={inputMessage.trim() ? 'translate-x-0.5' : ''} />
          </button>
        </form>
      </div>

    </div>
  );
}