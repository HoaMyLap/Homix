'use client';

import React from 'react';
import { ListChecks, User, Calendar, MessageSquare } from 'lucide-react';
import { Task, getPriorityBadgeColor } from './types';

interface KanbanCardProps {
  task: Task;
  colId: string;
  allTasks: Task[];
  canEditTask: boolean;
  getMemberName: (userId: string | null) => string;
  onSelectTask: (task: Task) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropOnCard: (e: React.DragEvent, targetStatus: string, targetCardId: string) => void;
}

export default function KanbanCard({
  task,
  colId,
  allTasks,
  canEditTask,
  getMemberName,
  onSelectTask,
  onDragStart,
  onDragOver,
  onDropOnCard,
}: KanbanCardProps) {
  const childSubtasks = allTasks.filter((t) => t.parentTaskId === task.id);
  const totalSubtasks = childSubtasks.length;
  const doneSubtasks = childSubtasks.filter((t) => t.status === 'DONE').length;
  const pendingSubtasks = totalSubtasks - doneSubtasks;

  return (
    <div
      draggable={canEditTask}
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDropOnCard(e, colId, task.id)}
      onClick={() => onSelectTask(task)}
      className={`glass hover:border-primary/30 p-4 rounded-xl transition-all border border-border hover:scale-[1.01] flex flex-col justify-between min-h-[120px] ${
        !canEditTask ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      <div>
        <h4 className="font-bold text-sm text-title line-clamp-2">{task.title}</h4>
        {task.description && (
          <p className="text-secondary text-xs mt-2 line-clamp-2">{task.description}</p>
        )}
      </div>

      {totalSubtasks > 0 && (
        <div className="mt-3 p-2.5 rounded-lg bg-surface border border-border flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 font-semibold text-heading">
              <ListChecks className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Subtasks ({totalSubtasks})</span>
            </div>
            <div className="flex items-center gap-2 font-bold text-[10px]">
              <span className="text-emerald-400">✓ {doneSubtasks} xong</span>
              {pendingSubtasks > 0 && (
                <span className="text-amber-400">⏳ {pendingSubtasks} chưa</span>
              )}
            </div>
          </div>

          <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-300"
              style={{ width: `${Math.round((doneSubtasks / totalSubtasks) * 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border-subtle flex flex-col gap-2">
        {task.assigneeId && (
          <div className="flex items-center gap-1.5 text-[10px] text-secondary">
            <User className="h-3 w-3 text-primary" />
            <span>{getMemberName(task.assigneeId)}</span>
          </div>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-[10px] text-secondary">
            <Calendar className="h-3 w-3 text-primary" />
            <span>Hạn: {new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-[10px] text-muted">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeColor(
              task.priority
            )}`}
          >
            {task.priority}
          </span>

          <div className="flex items-center gap-2">
            <MessageSquare className="h-3 w-3" />
            <span>Thảo luận</span>
          </div>
        </div>
      </div>
    </div>
  );
}
