import { useState } from 'react';
import toast from 'react-hot-toast';

const defaultForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  assignee: '',
  dueDate: '',
};

export default function TaskForm({ onSubmit, loading, onCancel, initialData = {}, members = [] }) {
  const [form, setForm] = useState({
    ...defaultForm,
    ...initialData,
    assignee: initialData?.assignee?._id || initialData?.assignee || '',
    dueDate: initialData?.dueDate ? initialData.dueDate.split('T')[0] : '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    const payload = { ...form };
    if (!payload.assignee) delete payload.assignee;
    if (!payload.dueDate) delete payload.dueDate;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Title <span className="text-red-400">*</span>
        </label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="What needs to be done?"
          className="input-field"
          required
          maxLength={200}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Add more details..."
          rows={3}
          className="input-field resize-none"
          maxLength={2000}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="in-review">In Review</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
            <option value="low">🟢 Low</option>
            <option value="medium">🔵 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Assignee</label>
          <select name="assignee" value={form.assignee} onChange={handleChange} className="input-field">
            <option value="">Unassigned</option>
            {members.map((m) => {
              const id = m.user?._id || m._id;
              const name = m.user?.name || m.name;
              return (
                <option key={id} value={id}>{name}</option>
              );
            })}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={loading || !form.title.trim()} className="btn-primary flex-1">
          {loading ? 'Saving...' : initialData._id ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
