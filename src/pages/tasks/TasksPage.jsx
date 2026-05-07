import { useEffect, useState } from 'react';
import { FiCheckSquare, FiSearch, FiAlertTriangle, FiCalendar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getTasksApi, updateTaskApi, deleteTaskApi } from '../../api/task.api';
import { getProjectsApi } from '../../api/project.api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import TaskForm from '../../components/tasks/TaskForm';
import TaskDetailModal from '../../components/tasks/TaskDetailModal';
import { format, isPast } from 'date-fns';

export default function TasksPage() {
  const { user, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsRes = await getProjectsApi();
        setProjects(projectsRes.data.data);

        // Fetch tasks per project — silently skip any 403/404 (member access restrictions)
        const allTasks = await Promise.all(
          projectsRes.data.data.map((p) =>
            getTasksApi({ project: p._id })
              .then((r) => r.data.data.map((t) => ({ ...t, projectName: p.name })))
              .catch(() => [])  // silently skip inaccessible projects
          )
        );
        setTasks(allTasks.flat());
      } catch (err) {
        // Only show error if the projects list itself failed
        if (err.response?.status !== 403) {
          toast.error('Failed to load tasks');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Members only see their assigned tasks (backend enforces this too)
  const myTasks = isAdmin
    ? tasks
    : tasks.filter((t) => t.assignee?._id === user?._id || t.assignee === user?._id);

  const filtered = myTasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? t.status === statusFilter : true;
    const matchPriority = priorityFilter ? t.priority === priorityFilter : true;
    const matchProject = projectFilter ? (t.project === projectFilter || t.project?._id === projectFilter) : true;
    const matchOverdue = overdueOnly
      ? t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done'
      : true;
    return matchSearch && matchStatus && matchPriority && matchProject && matchOverdue;
  });

  const overdueCount = myTasks.filter(
    (t) => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done'
  ).length;

  const handleUpdateTask = async (taskId, data) => {
    setSubmitting(true);
    try {
      const res = await updateTaskApi(taskId, data);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...res.data.data, projectName: t.projectName } : t))
      );
      setEditingTask(null);
      toast.success('Task updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTaskApi(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {isAdmin ? 'All Tasks' : 'My Tasks'}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {myTasks.length} tasks
            {overdueCount > 0 && (
              <span className="ml-2 text-red-400 flex items-center gap-1 inline-flex">
                <FiAlertTriangle size={12} /> {overdueCount} overdue
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-36">
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="in-review">In Review</option>
          <option value="done">Done</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="input-field sm:w-36">
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="input-field sm:w-44">
          <option value="">All projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        <button
          onClick={() => setOverdueOnly((v) => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
            overdueOnly
              ? 'bg-red-900/30 border-red-700 text-red-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100'
          }`}
        >
          <FiAlertTriangle size={14} />
          Overdue{overdueCount > 0 && ` (${overdueCount})`}
        </button>
      </div>

      {/* Tasks List */}
      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <FiCheckSquare size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-300 font-medium">No tasks found</p>
          <p className="text-slate-500 text-sm mt-1">
            {search || statusFilter || priorityFilter || overdueOnly
              ? 'Try adjusting your filters.'
              : 'No tasks assigned to you yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
            return (
              <div
                key={task._id}
                onClick={() => setViewingTask(task)}
                className="card flex items-center gap-4 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="font-medium text-slate-100 truncate">{task.title}</p>
                    {isOverdue && (
                      <span className="badge bg-red-900/50 text-red-400 flex items-center gap-1 flex-shrink-0">
                        <FiAlertTriangle size={9} /> Overdue
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <span>{task.projectName}</span>
                    {task.dueDate && (
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
                        <FiCalendar size={10} />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <Badge label={task.status} type={task.status} />
                  <Badge label={task.priority} type={task.priority} />
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                        aria-label="Edit"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        aria-label="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Task Modal */}
      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
        <TaskForm
          initialData={editingTask}
          members={[]}
          onSubmit={(data) => handleUpdateTask(editingTask._id, data)}
          loading={submitting}
          onCancel={() => setEditingTask(null)}
        />
      </Modal>

      {/* Task Detail Modal */}
      {viewingTask && (
        <TaskDetailModal
          task={viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={(t) => { setViewingTask(null); setEditingTask(t); }}
          onUpdate={handleUpdateTask}
        />
      )}
    </div>
  );
}
