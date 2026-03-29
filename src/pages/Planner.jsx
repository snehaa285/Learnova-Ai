import { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, 
  Plus, Clock, CheckCircle2, Circle, X, Save, Trash2,
  AlertCircle
} from 'lucide-react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../services/taskService';

const typeColors = {
  Exam: 'bg-red-500',
  Assignment: 'bg-blue-500',
  Study: 'bg-purple-500',
  Reading: 'bg-emerald-500',
  Project: 'bg-orange-500',
  Other: 'bg-gray-500',
};

const priorityColors = {
  High: 'text-red-500',
  Medium: 'text-yellow-500',
  Low: 'text-emerald-500',
};

export default function Planner() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: 'Anytime',
    type: 'Other',
    priority: 'Medium',
    category: '',
  });

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get calendar days for current month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty days for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getTasksForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(task => task.date === dateStr);
  };

  const getUpcomingTasks = () => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return tasks
      .filter(task => task.date >= todayStr)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: 'Anytime',
      type: 'Other',
      priority: 'Medium',
      category: '',
    });
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      date: task.date,
      time: task.time,
      type: task.type,
      priority: task.priority,
      category: task.category,
    });
    setShowModal(true);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updated = await updateTask(task._id, { completed: !task.completed });
      setTasks(tasks.map(t => t._id === updated._id ? updated : t));
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    try {
      if (!formData.title.trim()) {
        alert('Please enter a task title');
        return;
      }

      if (editingTask) {
        const updated = await updateTask(editingTask._id, formData);
        setTasks(tasks.map(t => t._id === updated._id ? updated : t));
      } else {
        const newTask = await createTask(formData);
        setTasks([...tasks, newTask]);
      }
      setShowModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save task');
    }
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const calendarDays = generateCalendarDays();
  const upcomingTasks = getUpcomingTasks();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            Study Planner <CalendarIcon className="text-primary dark:text-accent" size={24} />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Organize your schedule, assignments, and exams.</p>
        </div>
        <button 
          onClick={handleAddTask}
          className="flex items-center space-x-2 px-4 py-2.5 bg-primary hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Add Task</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700 dark:text-red-200">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* CALENDAR VIEW */}
        <div className="xl:col-span-2 bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden">
          
          {/* Calendar Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{monthName}</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={handleToday}
                className="px-3 py-1.5 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Today
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-4 sm:p-6">
            {/* Days of Week */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Days Grid */}
            {loading ? (
              <div className="text-center py-12">Loading calendar...</div>
            ) : (
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((day, index) => {
                  const dayTasks = getTasksForDate(day);
                  const isToday = day && new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

                  return (
                    <div 
                      key={index} 
                      className={`min-h-[80px] sm:min-h-[100px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col ${
                        day 
                          ? 'border-slate-100 dark:border-slate-800/50 bg-white dark:bg-dark-card hover:border-primary/30 dark:hover:border-accent/30' 
                          : 'border-transparent bg-slate-50/50 dark:bg-slate-800/20'
                      } ${isToday ? 'ring-2 ring-primary dark:ring-accent ring-offset-2 dark:ring-offset-[#0f172a]' : ''}`}
                    >
                      {day && (
                        <>
                          <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                            isToday 
                              ? 'bg-primary text-white' 
                              : 'text-slate-700 dark:text-slate-200'
                          }`}>
                            {day}
                          </span>
                          
                          {dayTasks.length > 0 && (
                            <div className="mt-auto space-y-1">
                              {dayTasks.slice(0, 2).map((task, i) => (
                                <div 
                                  key={i}
                                  className="w-full h-1.5 rounded-full"
                                  style={{ backgroundColor: typeColors[task.type] || typeColors.Other }}
                                ></div>
                              ))}
                              {dayTasks.length > 2 && (
                                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">+{dayTasks.length - 2}</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* UPCOMING TASKS SIDEBAR */}
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700/50">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Upcoming Tasks</h2>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400 text-sm">No upcoming tasks</p>
              </div>
            ) : (
              upcomingTasks.map((task) => (
                <div 
                  key={task._id} 
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-600 transition-colors group"
                >
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleToggleComplete(task)}
                      className={`mt-0.5 transition-colors ${
                        task.completed 
                          ? 'text-emerald-500' 
                          : 'text-slate-300 dark:text-slate-600 hover:text-emerald-500 dark:hover:text-emerald-400'
                      }`}
                    >
                      {task.completed ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-sm font-bold leading-tight ${
                          task.completed 
                            ? 'line-through text-slate-400' 
                            : 'text-slate-800 dark:text-white'
                        }`}>
                          {task.title}
                        </h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEditTask(task)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <Save size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-slate-400 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={12} /> {task.time}</span>
                        <span>{new Date(task.date).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="mt-3 flex gap-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${typeColors[task.type]} text-white`}>
                          {task.type}
                        </span>
                        {task.priority !== 'Medium' && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ADD/EDIT TASK MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add details (optional)"
                  rows="2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Time
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., 10:00 AM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {Object.keys(typeColors).map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Math, Science"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
                >
                  {editingTask ? 'Update' : 'Create'} Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}