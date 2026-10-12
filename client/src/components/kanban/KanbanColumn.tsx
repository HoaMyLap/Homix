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
      className="glass p-4 rounded-2xl border border-border flex flex-col max-h-[calc(100vh-195px)] min-h-[420px]"
    >
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full bg-current ${col.color}`} />
          <h3 className="font-bold text-sm font-display text-heading">{col.title}</h3>
          <span className="text-xs font-bold text-muted bg-surface border border-border px-2 py-0.5 rounded-lg">
            {colTasks.length}
          </span>
        </div>

        {canCreateTask && (
          <button
            type="button"
            onClick={() => onOpenCreateModal(col.id)}
            aria-label={`Thêm công việc vào cột ${col.title}`}
            title={`Thêm công việc vào cột ${col.title}`}
            className="ui-btn-ghost p-1.5 hover:text-primary"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-0">
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
          <div className="h-32 border border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted text-xs">
            <span>Kéo thẻ vào đây</span>
            {canCreateTask && (
              <button
                type="button"
                onClick={() => onOpenCreateModal(col.id)}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Thêm công việc
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
