// File: src/pages/StudyVault.jsx
import { useState, useEffect, useRef } from 'react';
import { 
  Search, UploadCloud, FileText, 
  MoreVertical, Filter, PlusCircle 
} from 'lucide-react';
import { fetchNotes, saveNote } from '../services/noteService';

export default function StudyVault() {
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true);
      try {
        const notesData = await fetchNotes();
        if (Array.isArray(notesData)) {
          setNotes(notesData);
        } else {
          setNotes([]);
        }
      } catch (err) {
        console.error('StudyVault fetchNotes error:', err);
        setError('Could not load notes. Please check your API connection.');
      } finally {
        setLoading(false);
      }
    };

    loadNotes();
  }, []);

  const handleUploadClick = () => {
    setUploadStatus('');
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a vault note representing the uploaded file
    const notePayload = {
      title: `Uploaded file: ${file.name}`,
      content: `File uploaded: ${file.name} (${(file.size / 1024).toFixed(2)} KB).`,
      category: 'Uploads',
    };

    try {
      setUploadStatus('Uploading file...');
      const created = await saveNote(notePayload);
      setNotes((prev) => [created, ...prev]);
      setUploadStatus(`Uploaded successfully: ${file.name}`);
      event.target.value = ''; // reset file input
    } catch (err) {
      console.error('StudyVault file upload error:', err);
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  const filteredNotes = notes.filter((note) => 
    note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Study Vault</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your notes, documents, and resources.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            onClick={handleUploadClick}
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary hover:bg-indigo-600 text-white rounded-lg font-medium transition-all shadow-sm"
          >
            <UploadCloud size={18} />
            <span>Upload File</span>
          </button>
          {uploadStatus && <span className="text-xs text-slate-200 dark:text-slate-300">{uploadStatus}</span>}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            accept=".txt,.md,.pdf,.doc,.docx,.png,.jpg,.jpeg,.ppt,.pptx"
          />
        </div>
      </div>

      {/* 2. SMART SEARCH & FILTER */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files, folders, or content inside documents..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-accent/50 text-slate-800 dark:text-white transition-all shadow-sm"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2.5 bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700/50 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* 3. NOTES LIST */}
      <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-white">My Vault Notes</h2>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors">
            <PlusCircle size={16} /> Add Note
          </button>
        </div>

        <div className="p-6 min-h-[250px]">
          {loading ? (
            <p className="text-slate-500 dark:text-slate-400">Loading notes...</p>
          ) : error ? (
            <p className="text-amber-500">{error}</p>
          ) : filteredNotes.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <p className="mb-2 text-lg font-semibold">No notes yet</p>
              <p>Create your first note from the planner or chatbot and it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <div key={note._id || note.id} className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl hover:shadow-lg transition-all">
                  <h3 className="font-semibold text-slate-800 dark:text-white truncate">{note.title || 'Untitled Note'}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">{note.content || 'No description available.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}