import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiEdit2, FiTrash2, FiPlus, FiUsers, FiArrowLeft,
  FiList, FiGrid, FiAlertTriangle, FiBarChart2,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import {
  getProjectByIdApi, updateProjectApi, deleteProjectApi,
  addMemberApi, removeMemberApi,
} from '../../api/project.api';
import { getTasksApi, createTaskApi, updateTaskApi, deleteTaskApi, getProjectAnalyticsApi } from '../../api/task.api';
import { getAllUsersApi } from '../../api/user.api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ProjectForm from '../../components/projects/ProjectForm';
import TaskForm from '../../components/tasks/TaskForm';
import KanbanBoard from '../../components/tasks/KanbanBoard';
import TaskDetailModal from '../../components/tasks/TaskDetailModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const STATUS_COLORS = { todo: '#64748b', 'in-progress': '#eab308', 'in-review': '#a855f7', done: '#22c55e' };
const PRIORITY_COLORS = { low: '#64748b', medium: '#3b82f6', high: '#ef4444' };

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('kanban'); // 'kanban' | 'list'

  const [editModal, setEditModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [membersModal, setMembersModal] = useState(false);
  const [analyticsModal, setAnalyticsModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        getProjectByIdApi(id),
        getTasksApi({ project: id }),
      ]);
      setProject(projRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateProject = async (data) => {
    setSubmitting(true);
    try {
      const res = await updateProjectApi(id, data);
      setProject(res.data.data);
      setEditModal(false);
      toast.success('Project updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await deleteProjectApi(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleCreateTask = async (data) => {
    setSubmitting(true);
    try {
      const res = await createTaskApi({ ...data, project: id });
      setTasks((prev) => [res.data.data, ...prev]);
      setTaskModal(false);
      toast.success('Task created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (taskId, data) => {
    try {
      const res = await updateTaskApi(taskId, data);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.data.data : t)));
      setEditingTask(null);
      toast.success('Task updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await updateTaskApi(taskId, { status: newStatus });
    } catch (err) {
      toast.error('Failed to update status');
      fetchData(); // revert
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

  const openMembersModal = async () => {
    try {
      const res = await getAllUsersApi();
      setUsers(res.data.data);
      setMembersModal(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    }
  };

  const openAnalyticsModal = async () => {
    try {
      const res = await getProjectAnalyticsApi(id);
      setAnalytics(res.data.data);
      setAnalyticsModal(true);
    } catch {
      toast.error('Failed to load analytics');
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await addMemberApi(id, { userId });
      await fetchData();
      toast.success('Member added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await removeMemberApi(id, userId);
      await fetchData();
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const memberIds = project?.members?.map((m) => m.user?._id) || [];
  const filteredNonMembers = users.filter(
    (u) =>
      u._id !== project?.owner?._id &&
      !memberIds.includes(u._id) &&
      (u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(memberSearch.toLowerCase()))
  );

  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="mt-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            aria-label="Back"
          >
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{project?.name}</h1>
            {project?.description && (
              <p className="text-slate-400 text-sm mt-0.5 max-w-xl">{project.description}</p>
            )}
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge label={project?.status} type={project?.status} />
              <Badge label={project?.priority} type={project?.priority} />
              {overdueTasks.length > 0 && (
                <span className="badge bg-red-900/50 text-red-400 flex items-center gap-1">
                  <FiAlertTriangle size={10} />
                  {overdueTasks.length} overdue
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={openAnalyticsModal}
            className="btn-secondary flex items-center gap-1.5 text-sm"
          >
            <FiBarChart2 size={14} /> Analytics
          </button>
          {isAdmin && (
            <>
              <button onClick={openMembersModal} className="btn-secondary flex items-center gap-1.5 text-sm">
                <FiUsers size={14} /> Members
              </button>
              <button onClick={() => setEditModal(true)} className="btn-secondary flex items-center gap-1.5 text-sm">
                <FiEdit2 size={14} /> Edit
              </button>
              <button onClick={handleDeleteProject} className="btn-danger flex items-center gap-1.5 text-sm">
                <FiTrash2 size={14} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'kanban' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <FiGrid size={14} /> Kanban
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === 'list' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <FiList size={14} /> List
          </button>
        </div>

        {isAdmin && (
          <button onClick={() => setTaskModal(true)} className="btn-primary flex items-center gap-2 text-sm">
            <FiPlus size={15} /> Add Task
          </button>
        )}
      </div>

      {/* Kanban / List view */}
      {tasks.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-slate-400">No tasks yet.{isAdmin ? ' Add the first task.' : ''}</p>
        </div>
      ) : view === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onEdit={setEditingTask}
          onDelete={handleDeleteTask}
          onAddTask={() => setTaskModal(true)}
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
            return (
              <div
                key={task._id}
                onClick={() => setViewingTask(task)}
                className="card flex items-center gap-4 hover:border-slate-700 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-slate-100 truncate">{task.title}</p>
                    {isOverdue && (
                      <span className="badge bg-red-900/50 text-red-400 flex items-center gap-1 flex-shrink-0">
                        <FiAlertTriangle size={9} /> Overdue
                      </span>
                    )}
                  </div>
                  {task.assignee && (
                    <p className="text-xs text-slate-500">{task.assignee.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge label={task.status} type={task.status} />
                  <Badge label={task.priority} type={task.priority} />
                  {isAdmin && (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingTask(task)}
                        className="p-1.5 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                        aria-label="Edit"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        aria-label="Delete"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Project Modal */}
      <Modal isOpen={editModal} onClose={() => setEditModal(false)} title="Edit Project">
        <ProjectForm
          initialData={project}
          onSubmit={handleUpdateProject}
          loading={submitting}
          onCancel={() => setEditModal(false)}
        />
      </Modal>

      {/* Create Task Modal */}
      <Modal isOpen={taskModal} onClose={() => setTaskModal(false)} title="Create Task">
        <TaskForm
          members={project?.members || []}
          onSubmit={handleCreateTask}
          loading={submitting}
          onCancel={() => setTaskModal(false)}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!editingTask} onClose={() => setEditingTask(null)} title="Edit Task">
        <TaskForm
          initialData={editingTask}
          members={project?.members || []}
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
          onUpdate={(taskId, data) => handleUpdateTask(taskId, data)}
        />
      )}

      {/* Members Modal */}
      <Modal isOpen={membersModal} onClose={() => setMembersModal(false)} title="Manage Members" size="lg">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Current Members</h3>
            <div className="space-y-2">
              {/* Owner */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {project?.owner?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-slate-200">{project?.owner?.name}</p>
                    <p className="text-xs text-slate-500">{project?.owner?.email}</p>
                  </div>
                </div>
                <Badge label="owner" type="admin" />
              </div>
              {project?.members?.map((m) => (
                <div key={m.user?._id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white">
                      {m.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-slate-200">{m.user?.name}</p>
                      <p className="text-xs text-slate-500">{m.user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge label={m.role} type="member" />
                    <button
                      onClick={() => handleRemoveMember(m.user?._id)}
                      className="text-red-400 hover:text-red-300 text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {project?.members?.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-2">No members yet</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Add Members</h3>
            <input
              type="text"
              placeholder="Search users..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="input-field mb-2 text-sm"
            />
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredNonMembers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-2">No users to add</p>
              ) : (
                filteredNonMembers.map((u) => (
                  <div key={u._id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-slate-200">{u.name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(u._id)}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Analytics Modal */}
      <Modal isOpen={analyticsModal} onClose={() => setAnalyticsModal(false)} title="Project Analytics" size="lg">
        {analytics && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="card text-center">
                <p className="text-2xl font-bold text-slate-100">{analytics.totalTasks}</p>
                <p className="text-xs text-slate-400 mt-1">Total Tasks</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-green-400">
                  {analytics.byStatus.find((s) => s._id === 'done')?.count || 0}
                </p>
                <p className="text-xs text-slate-400 mt-1">Completed</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-red-400">{analytics.overdueTasks}</p>
                <p className="text-xs text-slate-400 mt-1">Overdue</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-300 mb-3">Tasks by Status</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={analytics.byStatus.map((s) => ({ name: s._id, count: s.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.byStatus.map((s, i) => (
                      <Cell key={i} fill={STATUS_COLORS[s._id] || '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-300 mb-3">Tasks by Priority</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={analytics.byPriority.map((p) => ({ name: p._id, count: p.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {analytics.byPriority.map((p, i) => (
                      <Cell key={i} fill={PRIORITY_COLORS[p._id] || '#64748b'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
