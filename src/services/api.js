// This file consolidates all API calls for the application
// Import and re-export from individual service files for cleaner organization

export { generateQuiz } from './aiService';
export { saveNote, fetchNotes, removeNote } from './noteService';
export { fetchTasks, createTask, updateTask, deleteTask } from './taskService';