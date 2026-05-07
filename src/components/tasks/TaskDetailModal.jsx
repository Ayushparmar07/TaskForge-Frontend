import { useState } from 'react';
import { FiX, FiSend, FiCalendar, FiUser, FiAlertTriangle, FiEdit2 } from 'react-icons/fi';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import { addCommentApi } from '../../api/task.api';
import Badge from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

export default function TaskDetailModal({ task, onClose, onEdit, onUpdate }) {
  const { user, isAdmin } = useAuth();
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState(task.comments || []);

  if (!task) return null;

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';
  const isAssignee = task.assignee?._id === user?._id || task.assignee === user?._id;
  const canComment = isAdmin || isAssignee;

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await addCommentApi(task._id, { text: comment.trim() });
      setComments(data.data);
      setComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <Badge label={task.status} type={task.status} />
              <Badge label={task.priority} type={task.priority} />
              {isOverdue && (
                <span className="badge bg-red-900/50 text-red-400 flex items-center gap-1">
                  <FiAlertTriangle size={10} /> Overdue
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-slate-100 leading-snug">{task.title}</h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isAdmin && (
              <button
                onClick={() => { onClose(); onEdit(task); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800"
                aria-label="Edit task"
              >
                <FiEdit2 size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              aria-label="Close"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Description */}
          {task.description && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Description</p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assignee</p>
              {task.assignee ? (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                    {task.assignee.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300">{task.assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-slate-500">Unassigned</span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Due Date</p>
              {task.dueDate ? (
                <span className={`text-sm flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-slate-300'}`}>
                  <FiCalendar size={12} />
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              ) : (
                <span className="text-sm text-slate-500">No due date</span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Created by</p>
              <span className="text-sm text-slate-300">{task.createdBy?.name || '—'}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Created</p>
              <span className="text-sm text-slate-300">
                {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : '—'}
              </span>
            </div>
          </div>

          {/* Comments */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Comments ({comments.length})
            </p>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-500">No comments yet.</p>
              ) : (
                comments.map((c, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0">
                      {c.user?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 bg-slate-800 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-slate-300">{c.user?.name}</span>
                        <span className="text-xs text-slate-500">
                          {c.createdAt ? format(new Date(c.createdAt), 'MMM d, h:mm a') : ''}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {canComment && (
              <form onSubmit={handleComment} className="flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="input-field flex-1 text-sm"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="btn-primary px-3 flex-shrink-0"
                  aria-label="Send comment"
                >
                  <FiSend size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
