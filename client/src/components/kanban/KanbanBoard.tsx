'use client';

import React from 'react';
import { Task, KanbanColumn as KanbanColumnType } from './types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  columns: KanbanColumnType[];
  tasks: Task[];
  canCreateTask: boolean;
  canEditTask: boolean;
  getTasksByStatus: (status: string) => Task[];
  getMemberName: (userId: string | null) => string;
  onOpenCreateModal: (status: string) => void;
  onSelectTask: (task: Task) => void;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDropOnColumn: (e: React.DragEvent, targetStatus: string) => void;
  onDropOnCard: (e: React.DragEvent, targetStatus: string, targetCardId: string) => void;
}

export default function KanbanBoard({
  columns,
  tasks,
  canCreateTask,
  canEditTask,
  getTasksByStatus,
  getMemberName,
  onOpenCreateModal,
  onSelectTask,
  onDragStart,
  onDragOver,
  onDropOnColumn,
  onDropOnCard,
}: KanbanBoardProps) {
  return (
    <main className="max-w-7xl w-full mx-auto px-6 mt-3 grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10 items-start">
      {columns.map((col) => (
        <KanbanColumn
          key={col.id}
          col={col}
          colTasks={getTasksByStatus(col.id)}
          allTasks={tasks}
          canCreateTask={canCreateTask}
          canEditTask={canEditTask}
          getMemberName={getMemberName}
          onOpenCreateModal={onOpenCreateModal}
          onSelectTask={onSelectTask}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDropOnColumn={onDropOnColumn}
          onDropOnCard={onDropOnCard}
        />
      ))}
    </main>
  );
}
