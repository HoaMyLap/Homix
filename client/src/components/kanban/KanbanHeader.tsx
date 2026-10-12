'use client';

import React from 'react';
import {
  ArrowLeft,
  Sparkles,
  Search,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  CheckSquare,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Member } from './types';

interface KanbanHeaderProps {
  t: ReturnType<typeof useLanguage>['t'];
  language: string;
  project: { id: string; name: string; description: string; workspaceId: string } | null;
  members: Member[];
  projectTab: 'KANBAN' | 'FILES';
  setProjectTab: (tab: 'KANBAN' | 'FILES') => void;
  projectFilesCount: number;
  aiSearchQuery: string;
  setAiSearchQuery: (val: string) => void;
  aiSearchLoading: boolean;
  onAiSmartSearch: () => void;
  onBack: () => void;
  onOpenExcelModal: () => void;
  onFetchAiSummary: () => void;
  onRequestLeaveProject: () => void;
  onOpenMembersModal: () => void;
}

export default function KanbanHeader({
  t,
  language,
  project,
  members,
  projectTab,
  setProjectTab,
  projectFilesCount,
  aiSearchQuery,
  setAiSearchQuery,
  aiSearchLoading,
  onAiSmartSearch,
  onBack,
  onOpenExcelModal,
  onFetchAiSummary,
  onRequestLeaveProject,
  onOpenMembersModal,
}: KanbanHeaderProps) {
  return (
    <>
      <div className="max-w-7xl w-full mx-auto pl-16 pr-6 md:px-6 mt-6 flex flex-col md:flex-row md:items-center justify-between no-print gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-secondary hover:text-foreground transition-colors text-xs font-semibold shrink-0"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          {t('backToWorkspace')}
        </button>

        {/* AI Smart Search Bar */}
        <div className="flex-1 max-w-2xl mx-0 md:mx-4">
          <div className="glass px-3.5 py-1.5 rounded-xl border border-primary/30 flex items-center gap-2.5 shadow-sm focus-within:border-primary transition-all">
            <Sparkles className="h-4 w-4 text-primary shrink-0 animate-pulse" />
            <input
              type="text"
              value={aiSearchQuery}
              onChange={(e) => setAiSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onAiSmartSearch()}
              placeholder={t('aiSearchPlaceholderFull')}
              className="bg-transparent border-none text-xs text-foreground placeholder:text-muted focus:outline-none flex-1 font-sans"
            />
            <button
              onClick={onAiSmartSearch}
              disabled={aiSearchLoading || !aiSearchQuery.trim()}
              className="ui-btn-primary px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 shrink-0"
            >
              {aiSearchLoading ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white" />
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" />
                  AI Search
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onOpenExcelModal}
            className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-all active:scale-[0.98]"
            title="Nhập hàng loạt công việc từ file Excel (.xlsx)"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {t('addBatchExcel')}
          </button>
          <button
            onClick={onFetchAiSummary}
            className="flex items-center gap-2 bg-primary-muted hover:bg-primary/25 border border-primary/30 px-4 py-2 rounded-xl text-xs font-semibold text-primary transition-all active:scale-[0.98]"
          >
            <FileText className="h-4 w-4 text-primary animate-pulse" />
            {t('aiReport')}
          </button>
          <button
            onClick={onRequestLeaveProject}
            className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 dark:text-rose-400 transition-all active:scale-[0.98] shadow-sm"
            title="Gửi yêu cầu rời khỏi dự án này tới Admin"
          >
            {t('requestLeaveProjBtn')}
          </button>
        </div>
      </div>

      {/* Project Title, Description & Members Avatar Group */}
      <div className="max-w-7xl w-full mx-auto px-6 mt-4 mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl md:text-2xl font-black font-display text-heading tracking-tight flex items-center gap-2">
            <FolderArchive className="h-6 w-6 text-primary shrink-0" />
            {project ? project.name : '...'}
          </h1>
          <p className="text-secondary text-xs mt-0.5 max-w-xl">
            {project ? project.description : '...'}
          </p>
        </div>

        <div
          onClick={onOpenMembersModal}
          className="flex items-center gap-2.5 bg-surface/50 border border-border px-3.5 py-1.5 rounded-2xl shadow-sm max-w-xs ring-1 ring-border shrink-0 hover:bg-surface/85 transition-colors cursor-pointer"
        >
          <div className="flex -space-x-2.5 overflow-hidden">
            {members.slice(0, 4).map((m, idx) => (
              <div
                key={m.userId || idx}
                className="inline-block h-7 w-7 rounded-full bg-primary/10 border-2 border-card flex items-center justify-center font-bold text-[10px] text-primary shrink-0 ring-1 ring-border"
                title={`${m.fullname} (${m.role})`}
              >
                {m.fullname ? m.fullname.charAt(0).toUpperCase() : 'U'}
              </div>
            ))}
            {members.length > 4 && (
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-surface-elevated border-2 border-card text-[10px] font-black text-heading ring-1 ring-border shrink-0">
                +{members.length - 4}
              </div>
            )}
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-heading">
              {language === 'vi' ? 'Thành viên dự án' : 'Project Members'}
            </div>
            <div className="text-[10px] text-muted">
              {members.length} {language === 'vi' ? 'nhân sự' : 'members'}
            </div>
          </div>
        </div>
      </div>

      {/* Project View Tabs (Kanban vs Files) */}
      <div className="max-w-7xl mx-auto px-6 mt-6 flex items-center justify-between no-print border-b border-border-subtle pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setProjectTab('KANBAN')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              projectTab === 'KANBAN'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-surface border border-border text-secondary hover:text-foreground'
            }`}
          >
            <CheckSquare className="h-4 w-4" /> {t('kanbanBoardTab')}
          </button>

          <button
            onClick={() => setProjectTab('FILES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              projectTab === 'FILES'
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'bg-surface border border-border text-secondary hover:text-foreground'
            }`}
          >
            <FolderArchive className="h-4 w-4" /> {t('filesAndDocsTab')} ({projectFilesCount})
          </button>
        </div>
      </div>
    </>
  );
}
