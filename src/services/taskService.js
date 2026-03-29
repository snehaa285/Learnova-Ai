const API_URL = `${import.meta.env.VITE_API_URL}/api/tasks`;

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

export const fetchTasks = async () => {
  try {
    const response = await fetch(API_URL, { 
      method: 'GET', 
      ...getAuthConfig() 
    });
    if (!response.ok) throw new Error('Failed to fetch tasks');
    return await response.json();
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      ...getAuthConfig(),
      body: JSON.stringify({
        title: taskData.title,
        description: taskData.description || '',
        date: taskData.date,
        time: taskData.time || 'Anytime',
        type: taskData.type || 'Other',
        priority: taskData.priority || 'Medium',
        category: taskData.category || '',
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create task');
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      ...getAuthConfig(),
      body: JSON.stringify(taskData),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return await response.json();
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      ...getAuthConfig(),
    });
    if (!response.ok) throw new Error('Failed to delete task');
    return await response.json();
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

