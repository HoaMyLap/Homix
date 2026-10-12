'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { Task, KanbanColumn as KanbanColumnType } from './types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  col: KanbanColumnType;
  colTasks: Task[];
  allTasks: Task[];
  canCreateTask: boolean;
  canEditTask: boolean;
  getMemberName: (userId: string | null) => string;
  onOpenCreateModal: (status: string) => void;
  onSelectTask: (task: Task) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropOnColumn: (e: React.DragEvent, targetStatus: string) => void;
  onDropOnCard: (e: React.DragEvent, targetStatus: string, targetCardId: string) => void;
}

export default function KanbanColumn({
  col,
  colTasks,
  allTasks,
  canCreateTask,
  canEditTask,
  getMemberName,
  onOpenCreateModal,
  onSelectTask,
  onDragStart,
  onDragOver,
  onDropOnColumn,
  onDropOnCard,
}: KanbanColumnProps) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => onDropOnColumn(e, col.id)}
      className="glass p-5 rounded-2xl border border-border min-h-[500px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full bg-current ${col.color}`} />
          <h3 className="font-bold text-sm font-display">{col.title}</h3>
          <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-md">
            {colTasks.length}
          </span>
        </div>

        {canCreateTask && (
          <button onClick={() => onOpenCreateModal(col.id)} className="ui-btn-ghost p-1.5">
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
        {colTasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            colId={col.id}
            allTasks={allTasks}
            canEditTask={canEditTask}
            getMemberName={getMemberName}
            onSelectTask={onSelectTask}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDropOnCard={onDropOnCard}
          />
        ))}

        {colTasks.length === 0 && (
          <div className="h-32 border border-dashed border-border rounded-xl flex items-center justify-center text-muted text-xs">
            Kéo thẻ vào đây
          </div>
        )}
      </div>
    </div>
  );
}
