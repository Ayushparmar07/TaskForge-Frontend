import { FiEdit2, FiTrash2, FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import Badge from '../common/Badge';

const priorityDot = {
  low: 'bg-slate-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 group hover:border-slate-600 transition-colors">
      {/* Priority dot + title */}
      <div className="flex items-start gap-2 mb-2">
        <span
          className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority] || 'bg-slate-500'}`}
          title={`Priority: ${task.priority}`}
        />
        <p className="text-sm font-medium text-slate-100 leading-snug flex-1">{task.title}</p>
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 mb-2 line-clamp-2 ml-4">{task.description}</p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap ml-4 mb-2">
        <Badge label={task.priority} type={task.priority} />
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between ml-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {task.assignee && (
            <span className="flex items-center gap-1">
              <FiUser size={11} />
              {task.assignee.name}
            </span>
          )}
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
              <FiCalendar size={11} />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-700"
            aria-label="Edit task"
          >
            <FiEdit2 size={12} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700"
            aria-label="Delete task"
          >
            <FiTrash2 size={12} />
          </button>
        </div>
      </div>

      {/* Quick status change */}
      <div className="mt-2 ml-4">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="text-xs bg-slate-700 border border-slate-600 text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Change task status"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="in-review">In Review</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  );
}
