'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronRight,
  Sparkles,
  Search,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  CheckSquare,
  Plus,
  Filter,
  UserCheck,
  LogOut,
  X,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Member } from './types';

interface KanbanHeaderProps {
  t: ReturnType<typeof useLanguage>['t'];
  language: string;
  project: { id: string; name: string; description: string; workspaceId: string } | null;
  workspaceName?: string;
  members: Member[];
  canCreateTask?: boolean;
  projectTab: 'KANBAN' | 'FILES';
  setProjectTab: (tab: 'KANBAN' | 'FILES') => void;
  projectFilesCount: number;
  aiSearchQuery: string;
  setAiSearchQuery: (val: string) => void;
  aiSearchLoading: boolean;
  onAiSmartSearch: () => void;
  quickFilterText?: string;
  setQuickFilterText?: (val: string) => void;
  quickFilterPriority?: string;
  setQuickFilterPriority?: (val: string) => void;
  quickFilterMyTasks?: boolean;
  setQuickFilterMyTasks?: (val: boolean) => void;
  onBack: () => void;
  onOpenCreateTask?: () => void;
  onOpenExcelModal: () => void;
  onFetchAiSummary: () => void;
  onRequestLeaveProject: () => void;
  onOpenMembersModal: () => void;
}

export default function KanbanHeader({
  t,
  language,
  project,
  workspaceName,
  members,
  canCreateTask = false,
  projectTab,
  setProjectTab,
  projectFilesCount,
  aiSearchQuery,
  setAiSearchQuery,
  aiSearchLoading,
  onAiSmartSearch,
  quickFilterText = '',
  setQuickFilterText,
  quickFilterPriority = 'ALL',
  setQuickFilterPriority,
  quickFilterMyTasks = false,
  setQuickFilterMyTasks,
  onBack,
  onOpenCreateTask,
  onOpenExcelModal,
  onFetchAiSummary,
  onRequestLeaveProject,
  onOpenMembersModal,
}: KanbanHeaderProps) {
  const hasActiveFilters =
    quickFilterText.trim() !== '' || quickFilterPriority !== 'ALL' || quickFilterMyTasks;

  return (
    <header className="max-w-7xl w-full mx-auto pl-16 pr-6 md:px-6 pt-4 pb-2 no-print space-y-3">
      {/* TIER 1: Breadcrumb + Project Identity + Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        {/* Left: Breadcrumb & Project Title */}
        <div className="min-w-0 space-y-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-semibold text-secondary flex-wrap">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{workspaceName || t('backToWorkspace')}</span>
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-muted shrink-0" />
            <span className="text-primary font-bold truncate max-w-[240px]">
              {project ? project.name : '...'}
            </span>
          </nav>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg md:text-xl font-black font-display text-heading tracking-tight flex items-center gap-2">
              <FolderArchive className="h-5 w-5 text-primary shrink-0" />
              <span className="truncate">{project ? project.name : '...'}</span>
            </h1>
            {project?.description && (
              <span className="text-secondary text-xs hidden sm:inline-block truncate max-w-md border-l border-border pl-3">
                {project.description}
              </span>
            )}
          </div>
        </div>

        {/* Right: Member Stack & Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Interactive Member Stack Pill */}
          <button
            type="button"
            onClick={onOpenMembersModal}
            className="flex items-center gap-2 bg-surface/70 border border-border px-3 py-1.5 rounded-xl shadow-xs hover:border-primary/40 transition-all cursor-pointer"
            title={language === 'vi' ? 'Quản lý thành viên dự án' : 'Manage Project Members'}
          >
            <div className="flex -space-x-2 overflow-hidden">
              {members.slice(0, 4).map((m, idx) => (
                <div
                  key={m.userId || idx}
                  className="inline-flex h-6 w-6 rounded-full bg-primary/15 border-2 border-card items-center justify-center font-bold text-[10px] text-primary shrink-0"
                  title={`${m.fullname} (${m.role})`}
                >
                  {m.fullname ? m.fullname.charAt(0).toUpperCase() : 'U'}
                </div>
              ))}
              {members.length > 4 && (
                <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-surface-elevated border-2 border-card text-[10px] font-black text-heading shrink-0">
                  +{members.length - 4}
                </div>
              )}
            </div>
            <span className="text-xs font-bold text-heading">
              {members.length} <span className="hidden sm:inline font-medium text-secondary">{language === 'vi' ? 'thành viên' : 'members'}</span>
            </span>
          </button>

          {/* Primary CTA: Create Task */}
          {canCreateTask && onOpenCreateTask && (
            <button
              type="button"
              onClick={onOpenCreateTask}
              className="ui-btn-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{language === 'vi' ? 'Tạo công việc' : 'New Task'}</span>
            </button>
          )}

          {/* AI Summary Report */}
          <button
            type="button"
            onClick={onFetchAiSummary}
            className="flex items-center gap-1.5 bg-primary-muted hover:bg-primary/20 border border-primary/30 px-3 py-2 rounded-xl text-xs font-bold text-primary transition-all active:scale-[0.98] cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span>{t('aiReport')}</span>
          </button>

          {/* Excel Batch Import */}
          <button
            type="button"
            onClick={onOpenExcelModal}
            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all active:scale-[0.98] cursor-pointer"
            title="Nhập hàng loạt công việc từ file Excel (.xlsx)"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('addBatchExcel')}</span>
          </button>

          {/* Subtle Leave Project Button */}
          <button
            type="button"
            onClick={onRequestLeaveProject}
            className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/25 px-2.5 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 transition-all active:scale-[0.98] cursor-pointer"
            title={language === 'vi' ? 'Gửi yêu cầu rời khỏi dự án này tới Admin' : 'Request to leave project'}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">{t('requestLeaveProjBtn')}</span>
          </button>
        </div>
      </div>

      {/* TIER 2: View Switcher Tabs + Quick Filters + AI Smart Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-surface/70 p-1 rounded-xl border border-border self-start shrink-0">
          <button
            type="button"
            onClick={() => setProjectTab('KANBAN')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              projectTab === 'KANBAN'
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary hover:text-foreground'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>{t('kanbanBoardTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => setProjectTab('FILES')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              projectTab === 'FILES'
                ? 'bg-primary text-white shadow-sm'
                : 'text-secondary hover:text-foreground'
            }`}
          >
            <FolderArchive className="h-3.5 w-3.5" />
            <span>{t('filesAndDocsTab')} ({projectFilesCount})</span>
          </button>
        </div>

        {/* Right: Quick Filter Bar & AI Smart Search (When on Kanban Tab) */}
        {projectTab === 'KANBAN' && (
          <div className="flex flex-wrap items-center gap-2 flex-1 lg:justify-end">
            {/* Instant Keyword Filter */}
            {setQuickFilterText && (
              <div className="relative min-w-[160px] sm:w-44">
                <Filter className="h-3.5 w-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={quickFilterText}
                  onChange={(e) => setQuickFilterText(e.target.value)}
                  placeholder={language === 'vi' ? 'Lọc nhanh thẻ...' : 'Quick filter...'}
                  className="w-full bg-surface border border-border rounded-xl pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
                />
                {quickFilterText && (
                  <button
                    type="button"
                    onClick={() => setQuickFilterText('')}
                    aria-label="Xóa từ khóa lọc"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}

            {/* Priority Quick Select */}
            {setQuickFilterPriority && (
              <select
                value={quickFilterPriority}
                onChange={(e) => setQuickFilterPriority(e.target.value)}
                aria-label={language === 'vi' ? 'Lọc theo mức độ ưu tiên' : 'Filter by priority'}
                className="bg-surface border border-border rounded-xl px-2.5 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="ALL">{language === 'vi' ? 'Mọi mức độ' : 'All Priorities'}</option>
                <option value="URGENT">{language === 'vi' ? 'Khẩn cấp (Urgent)' : 'Urgent'}</option>
                <option value="HIGH">{language === 'vi' ? 'Cao (High)' : 'High'}</option>
                <option value="MEDIUM">{language === 'vi' ? 'Trung bình (Medium)' : 'Medium'}</option>
                <option value="LOW">{language === 'vi' ? 'Thấp (Low)' : 'Low'}</option>
              </select>
            )}

            {/* My Tasks Quick Toggle */}
            {setQuickFilterMyTasks && (
              <button
                type="button"
                onClick={() => setQuickFilterMyTasks(!quickFilterMyTasks)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  quickFilterMyTasks
                    ? 'bg-primary/15 border-primary text-primary'
                    : 'bg-surface border-border text-secondary hover:text-foreground'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>{language === 'vi' ? 'Việc của tôi' : 'My Tasks'}</span>
              </button>
            )}

            {hasActiveFilters && setQuickFilterText && setQuickFilterPriority && setQuickFilterMyTasks && (
              <button
                type="button"
                onClick={() => {
                  setQuickFilterText('');
                  setQuickFilterPriority('ALL');
                  setQuickFilterMyTasks(false);
                }}
                className="text-[11px] font-bold text-rose-500 hover:underline px-1.5 cursor-pointer"
              >
                {language === 'vi' ? 'Xóa lọc' : 'Clear'}
              </button>
            )}

            {/* AI Smart Search Bar */}
            <div className="glass px-2.5 py-1 rounded-xl border border-primary/30 flex items-center gap-2 shadow-xs focus-within:border-primary transition-all min-w-[220px] sm:w-64">
              <Sparkles className="h-3.5 w-3.5 text-primary shrink-0 animate-pulse" />
              <input
                type="text"
                value={aiSearchQuery}
                onChange={(e) => setAiSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onAiSmartSearch()}
                placeholder={language === 'vi' ? 'Tìm ngữ nghĩa bằng AI...' : 'AI Semantic Search...'}
                className="bg-transparent border-none text-xs text-foreground placeholder:text-muted focus:outline-none flex-1 font-sans min-w-0"
              />
              <button
                type="button"
                onClick={onAiSmartSearch}
                disabled={aiSearchLoading || !aiSearchQuery.trim()}
                className="ui-btn-primary px-2.5 py-1 text-[11px] font-bold flex items-center gap-1 shrink-0 rounded-lg"
              >
                {aiSearchLoading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/20 border-t-white" />
                ) : (
                  <>
                    <Search className="h-3 w-3" />
                    <span>AI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

