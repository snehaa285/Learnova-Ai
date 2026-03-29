const API_URL = `${import.meta.env.VITE_API_URL}/api/notes`;

// Helper to get the token for protected routes
const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchNotes = async () => {
  const response = await fetch(API_URL, { 
    method: 'GET', 
    ...getAuthConfig() 
  });
  if (!response.ok) throw new Error('Failed to fetch notes');
  return await response.json();
};

export const saveNote = async (noteData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    ...getAuthConfig(),
    body: JSON.stringify(noteData),
  });
  if (!response.ok) throw new Error('Failed to create note');
  return await response.json();
};

export const removeNote = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    ...getAuthConfig(),
  });
  if (!response.ok) throw new Error('Failed to delete note');
  return await response.json();
};