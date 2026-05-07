import { useState } from 'react';

const defaultForm = {
  name: '',
  description: '',
  status: 'planning',
  priority: 'medium',
  startDate: '',
  endDate: '',
};

export default function ProjectForm({ onSubmit, loading, onCancel, initialData = {} }) {
  const [form, setForm] = useState({ ...defaultForm, ...initialData });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          Project Name <span className="text-red-400">*</span>
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Website Redesign"
          className="input-field"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Brief project description..."
          rows={3}
          className="input-field resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input-field">
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="input-field">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">End Date</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
        <button type="submit" disabled={loading || !form.name.trim()} className="btn-primary flex-1">
          {loading ? 'Saving...' : initialData._id ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
