import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiPlus, FiCalendar, FiUser, FiEdit2, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import { format, isPast } from 'date-fns';
import Badge from '../common/Badge';
import { useAuth } from '../../context/AuthContext';

const COLUMNS = [
  { key: 'todo', label: 'To Do', color: 'border-slate-600' },
  { key: 'in-progress', label: 'In Progress', color: 'border-yellow-500' },
  { key: 'in-review', label: 'In Review', color: 'border-purple-500' },
  { key: 'done', label: 'Done', color: 'border-green-500' },
];

const priorityDot = { low: 'bg-slate-500', medium: 'bg-blue-500', high: 'bg-red-500' };

function TaskCard({ task, index, onEdit, onDelete, isAdmin }) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done';

  return (
    <Draggable draggableId={task._id} index={index} isDragDisabled={!isAdmin}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-slate-800 border rounded-lg p-3 group transition-all ${
            snapshot.isDragging
              ? 'border-blue-500 shadow-lg shadow-blue-500/20 rotate-1'
              : 'border-slate-700 hover:border-slate-600'
          }`}
        >
          {/* Priority + title */}
          <div className="flex items-start gap-2 mb-2">
            <span
              className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${priorityDot[task.priority] || 'bg-slate-500'}`}
              title={`Priority: ${task.priority}`}
            />
            <p className="text-sm font-medium text-slate-100 leading-snug flex-1 line-clamp-2">
              {task.title}
            </p>
          </div>

          {task.description && (
            <p className="text-xs text-slate-400 mb-2 line-clamp-2 ml-4">{task.description}</p>
          )}

          {/* Overdue warning */}
          {isOverdue && (
            <div className="flex items-center gap-1 ml-4 mb-2 text-red-400 text-xs">
              <FiAlertTriangle size={11} />
              <span>Overdue</span>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between ml-4 mt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
              {task.assignee && (
                <span className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold">
                    {task.assignee.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="truncate max-w-[60px]">{task.assignee.name?.split(' ')[0]}</span>
                </span>
              )}
              {task.dueDate && (
                <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-400' : ''}`}>
                  <FiCalendar size={10} />
                  {format(new Date(task.dueDate), 'MMM d')}
                </span>
              )}
            </div>

            {isAdmin && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(task)}
                  className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-700"
                  aria-label="Edit task"
                >
                  <FiEdit2 size={11} />
                </button>
                <button
                  onClick={() => onDelete(task._id)}
                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700"
                  aria-label="Delete task"
                >
                  <FiTrash2 size={11} />
                </button>
              </div>
            )}
          </div>

          <div className="mt-2 ml-4">
            <Badge label={task.priority} type={task.priority} />
          </div>
        </div>
      )}
    </Draggable>
  );
}

export default function KanbanBoard({ tasks, onStatusChange, onEdit, onDelete, onAddTask }) {
  const { isAdmin } = useAuth();

  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key);
    return acc;
  }, {});

  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      if (result.destination.droppableId === result.source.droppableId) return;

      const taskId = result.draggableId;
      const newStatus = result.destination.droppableId;
      onStatusChange(taskId, newStatus);
    },
    [onStatusChange]
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className={`bg-slate-900/60 border-t-2 ${col.color} border-x border-b border-slate-800 rounded-xl flex flex-col`}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-300">{col.label}</h3>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {tasksByStatus[col.key].length}
                </span>
              </div>
              {isAdmin && col.key === 'todo' && (
                <button
                  onClick={onAddTask}
                  className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                  aria-label="Add task"
                >
                  <FiPlus size={15} />
                </button>
              )}
            </div>

            {/* Droppable area */}
            <Droppable droppableId={col.key} isDropDisabled={!isAdmin}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-2 space-y-2 min-h-[120px] transition-colors rounded-b-xl ${
                    snapshot.isDraggingOver ? 'bg-blue-500/5' : ''
                  }`}
                >
                  {tasksByStatus[col.key].map((task, index) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      index={index}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      isAdmin={isAdmin}
                    />
                  ))}
                  {provided.placeholder}
                  {tasksByStatus[col.key].length === 0 && !snapshot.isDraggingOver && (
                    <p className="text-xs text-slate-600 text-center py-6">
                      {isAdmin ? 'Drop tasks here' : 'No tasks'}
                    </p>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
