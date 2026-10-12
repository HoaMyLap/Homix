'use client';

import React from 'react';
import {
  Sparkles,
  X,
  ListChecks,
  Check,
  FileSpreadsheet,
  Trash,
  Download,
  Upload,
  Users,
  Plus,
  Bell,
  Heart,
} from 'lucide-react';
import { Task, Member } from './types';

// 1. Create Task Modal
interface CreateTaskModalProps {
  show: boolean;
  onClose: () => void;
  taskError: string;
  taskLoading: boolean;
  newTaskTitle: string;
  setNewTaskTitle: (val: string) => void;
  newTaskDesc: string;
  setNewTaskDesc: (val: string) => void;
  newTaskPriority: string;
  setNewTaskPriority: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateTaskModal({
  show,
  onClose,
  taskError,
  taskLoading,
  newTaskTitle,
  setNewTaskTitle,
  newTaskDesc,
  setNewTaskDesc,
  newTaskPriority,
  setNewTaskPriority,
  onSubmit,
}: CreateTaskModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md glass p-8 rounded-2xl relative">
        <h3 className="text-xl font-bold mb-6 font-display">Tạo Công việc mới</h3>

        {taskError && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 text-sm">
            {taskError}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Tiêu đề công việc
            </label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Ví dụ: Thiết kế Database, Code API..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
              placeholder="Nhập yêu cầu chi tiết của công việc..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-zinc-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Độ ưu tiên
            </label>
            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
            >
              <option value="LOW">LOW (Thấp)</option>
              <option value="MEDIUM">MEDIUM (Trung bình)</option>
              <option value="HIGH">HIGH (Cao)</option>
              <option value="URGENT">URGENT (Khẩn cấp)</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-800"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={taskLoading}
              className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-medium transition-all"
            >
              {taskLoading ? 'Đang tạo...' : 'Tạo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. AI Smart Search Modal
interface AiSmartSearchModalProps {
  show: boolean;
  onClose: () => void;
  aiSearchQuery: string;
  aiSearchError: string;
  aiSearchResults: Array<{ task: Task; relevanceScore: number; reason: string }>;
  tasks: Task[];
  onSelectTask: (task: Task) => void;
}

export function AiSmartSearchModal({
  show,
  onClose,
  aiSearchQuery,
  aiSearchError,
  aiSearchResults,
  tasks,
  onSelectTask,
}: AiSmartSearchModalProps) {
  if (!show) return null;
  return (
    <div className="ui-modal-overlay bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl relative max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-foreground">
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-heading">
                Kết quả AI Tìm kiếm Thông minh
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Truy vấn: <span className="font-semibold text-primary">&quot;{aiSearchQuery}&quot;</span> ·{' '}
                {aiSearchResults.length} công việc trùng khớp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ui-btn-ghost p-2 rounded-xl text-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {aiSearchError && <div className="mx-6 mt-4 ui-alert-error text-xs">{aiSearchError}</div>}

        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {aiSearchResults.length === 0 ? (
            <div className="text-center py-12 text-muted text-xs bg-surface/40 rounded-xl border border-border">
              <Sparkles className="h-10 w-10 text-muted mx-auto mb-3" />
              Không tìm thấy công việc nào phù hợp với yêu cầu tìm kiếm của bạn.
            </div>
          ) : (
            aiSearchResults.map((res, idx) => {
              const childSubtasks = tasks.filter((t) => t.parentTaskId === res.task.id);
              const totalSubtasks = childSubtasks.length;
              const doneSubtasks = childSubtasks.filter((t) => t.status === 'DONE').length;
              const pendingSubtasks = totalSubtasks - doneSubtasks;

              return (
                <div
                  key={res.task.id || idx}
                  onClick={() => {
                    onSelectTask(res.task);
                    onClose();
                  }}
                  className="bg-surface hover:bg-hover border border-border hover:border-primary/40 p-4.5 rounded-xl cursor-pointer transition-all flex flex-col gap-2.5 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="font-bold text-sm text-title">{res.task.title}</h4>
                    <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                      {(res.relevanceScore * 100).toFixed(0)}% Phù hợp
                    </span>
                  </div>

                  <div className="text-xs bg-primary/10 border border-primary/25 p-3 rounded-xl text-primary font-medium flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                    <span className="leading-relaxed">{res.reason}</span>
                  </div>

                  {totalSubtasks > 0 && (
                    <div className="p-2.5 rounded-lg bg-surface-elevated border border-border flex flex-col gap-1.5">
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

                  <div className="flex items-center justify-between text-[11px] text-muted pt-2.5 border-t border-border-subtle mt-0.5">
                    <span>
                      Trạng thái: <strong className="text-foreground">{res.task.status}</strong> · Ưu
                      tiên: <strong className="text-foreground">{res.task.priority}</strong>
                    </span>
                    {res.task.dueDate && (
                      <span>Hạn: {new Date(res.task.dueDate).toLocaleDateString('vi-VN')}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// 3. AI Subtask Confirmation Modal
interface AiSubtaskModalProps {
  show: boolean;
  onClose: () => void;
  aiSubtaskSuggestions: Array<{ title: string; selected: boolean }>;
  setAiSubtaskSuggestions: React.Dispatch<
    React.SetStateAction<Array<{ title: string; selected: boolean }>>
  >;
  aiSubtaskAdding: boolean;
  onConfirmAdd: () => void;
}

export function AiSubtaskModal({
  show,
  onClose,
  aiSubtaskSuggestions,
  setAiSubtaskSuggestions,
  aiSubtaskAdding,
  onConfirmAdd,
}: AiSubtaskModalProps) {
  if (!show) return null;
  return (
    <div className="ui-modal-overlay bg-black/80 backdrop-blur-md z-[60]">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl relative max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-foreground">
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-heading">
                Xác nhận Subtasks gợi ý từ AI
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Chọn các bước công việc bạn muốn tự động thêm vào task:
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ui-btn-ghost p-2 rounded-xl text-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-3 flex items-center justify-between text-xs border-b border-border-subtle shrink-0 bg-surface/30">
          <span className="font-semibold text-secondary">
            Đã chọn:{' '}
            <strong className="text-primary">
              {aiSubtaskSuggestions.filter((s) => s.selected).length}/{aiSubtaskSuggestions.length}
            </strong>
          </span>
          <button
            type="button"
            onClick={() => {
              const allSelected = aiSubtaskSuggestions.every((s) => s.selected);
              setAiSubtaskSuggestions((prev) =>
                prev.map((s) => ({ ...s, selected: !allSelected }))
              );
            }}
            className="text-xs text-primary hover:underline font-semibold"
          >
            {aiSubtaskSuggestions.every((s) => s.selected) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-2.5">
          {aiSubtaskSuggestions.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                item.selected
                  ? 'bg-primary/10 border-primary/30 text-foreground'
                  : 'bg-surface/50 border-border text-muted opacity-60'
              }`}
            >
              <input
                type="checkbox"
                checked={item.selected}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAiSubtaskSuggestions((prev) =>
                    prev.map((s, i) => (i === idx ? { ...s, selected: checked } : s))
                  );
                }}
                className="w-4.5 h-4.5 rounded accent-primary cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={item.title}
                onChange={(e) => {
                  const val = e.target.value;
                  setAiSubtaskSuggestions((prev) =>
                    prev.map((s, i) => (i === idx ? { ...s, title: val } : s))
                  );
                }}
                className="bg-transparent border-none text-xs font-medium text-foreground focus:outline-none flex-1 font-sans"
              />
              <button
                type="button"
                onClick={() => {
                  setAiSubtaskSuggestions((prev) => prev.filter((_, i) => i !== idx));
                }}
                className="text-muted hover:text-error transition-colors p-1 rounded"
                title="Xóa gợi ý này"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border bg-surface/50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="ui-btn-secondary px-4 py-2 text-xs font-semibold"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={
              aiSubtaskAdding || aiSubtaskSuggestions.filter((s) => s.selected).length === 0
            }
            onClick={onConfirmAdd}
            className="ui-btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-2"
          >
            {aiSubtaskAdding ? (
              <>
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white" />
                Đang thêm...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Xác nhận thêm {aiSubtaskSuggestions.filter((s) => s.selected).length} Subtasks
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// 4. Excel Task Import Modal
interface ExcelTaskItem {
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: string;
}

interface ExcelImportModalProps {
  show: boolean;
  onClose: () => void;
  excelTaskError: string;
  excelTaskFileName: string;
  excelTasks: ExcelTaskItem[];
  excelTaskLoading: boolean;
  excelTaskFileInputRef: React.RefObject<HTMLInputElement | null>;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  onDownloadSample: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ExcelImportModal({
  show,
  onClose,
  excelTaskError,
  excelTaskFileName,
  excelTasks,
  excelTaskLoading,
  excelTaskFileInputRef,
  onUpload,
  onClearFile,
  onDownloadSample,
  onSubmit,
}: ExcelImportModalProps) {
  if (!show) return null;
  return (
    <div className="ui-modal-overlay bg-black/80 backdrop-blur-md z-[60]">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl relative shadow-2xl overflow-hidden text-foreground">
        <div className="flex items-center justify-between p-6 border-b border-border bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display text-heading">
                Nhập danh sách công việc từ Excel
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Thêm hàng loạt công việc vào bảng Kanban từ file .xlsx
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ui-btn-ghost p-2 rounded-xl text-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {excelTaskError && <div className="ui-alert-error text-xs">{excelTaskError}</div>}

          {!excelTaskFileName ? (
            <div className="border-2 border-dashed border-border hover:border-emerald-500/50 bg-surface/50 p-6 rounded-2xl text-center transition-all space-y-2">
              <FileSpreadsheet className="h-10 w-10 text-emerald-400 mx-auto mb-1" />
              <p className="text-sm font-bold text-heading">Chọn file Excel (.xlsx / .xls)</p>
              <p className="text-xs text-muted">
                Yêu cầu có các cột: &quot;Tiêu đề&quot;, &quot;Mô tả&quot;, &quot;Trạng thái&quot;, &quot;Mức độ ưu tiên&quot;
              </p>
              <input
                ref={excelTaskFileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={onUpload}
                className="mt-3 text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 cursor-pointer"
              />
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-heading truncate">{excelTaskFileName}</p>
                    <p className="text-[11px] font-semibold text-emerald-400 mt-0.5">
                      ✓ Đã tìm thấy {excelTasks.length} công việc hợp lệ
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClearFile}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 transition-colors shrink-0 flex items-center gap-1.5 text-xs font-semibold"
                  title="Xóa file để chọn file khác"
                >
                  <Trash className="h-4 w-4" /> Xóa
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
              <Download className="h-4 w-4 text-primary" />
              <span>Chưa có file mẫu? Tải ngay template chuẩn:</span>
            </div>
            <button
              type="button"
              onClick={onDownloadSample}
              className="text-xs font-bold text-primary hover:underline px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20"
            >
              Tải file mẫu (.xlsx)
            </button>
          </div>

          {excelTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                <span>✓ Đã trích xuất {excelTasks.length} công việc:</span>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-surface border border-border text-xs">
                {excelTasks.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-background/60 border border-border-subtle"
                  >
                    <span className="font-semibold text-heading truncate max-w-[200px]">
                      {idx + 1}. {t.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                        {t.status}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="ui-btn-secondary px-5 py-2.5 text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={excelTaskLoading || excelTasks.length === 0}
              className="ui-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
            >
              {excelTaskLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white" />
                  Đang nhập...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Nhập {excelTasks.length} công việc
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 5. Project Members List & Invite Modal
interface ProjectMembersModalProps {
  show: boolean;
  onClose: () => void;
  language: string;
  members: Member[];
  canInviteToProject: boolean;
  projectInviteEmail: string;
  setProjectInviteEmail: (val: string) => void;
  projectInviteRole: string;
  setProjectInviteRole: (val: string) => void;
  projectInviteLoading: boolean;
  projectInviteMessage: string;
  projectInviteError: string;
  onInvite: (e: React.FormEvent) => void;
}

export function ProjectMembersModal({
  show,
  onClose,
  language,
  members,
  canInviteToProject,
  projectInviteEmail,
  setProjectInviteEmail,
  projectInviteRole,
  setProjectInviteRole,
  projectInviteLoading,
  projectInviteMessage,
  projectInviteError,
  onInvite,
}: ProjectMembersModalProps) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm no-print p-4">
      <div className="glass w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-surface/30">
          <h3 className="text-base font-bold font-display text-heading flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {language === 'vi' ? 'Thành viên dự án' : 'Project Members'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-secondary hover:text-foreground hover:bg-surface/50 p-1.5 rounded-xl transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
              {language === 'vi' ? 'Danh sách thành viên' : 'Member List'} ({members.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {members
                .slice()
                .sort((a, b) => {
                  const roleOrder: Record<string, number> = { ADMIN: 1, MEMBER: 2, VIEWER: 3 };
                  return (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99);
                })
                .map((m) => (
                  <div
                    key={m.userId}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-surface/40 border border-border-subtle hover:bg-surface/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                        {m.fullname ? m.fullname.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-100">{m.fullname}</div>
                        <div className="text-[10px] text-muted">{m.email}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        m.role === 'ADMIN'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : m.role === 'MEMBER'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {canInviteToProject ? (
            <form onSubmit={onInvite} className="pt-4 border-t border-border-subtle space-y-4">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
                {language === 'vi'
                  ? 'Mời thành viên mới vào dự án'
                  : 'Invite New Member to Project'}
              </h4>

              {projectInviteMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs font-semibold text-emerald-400 animate-fadeIn">
                  {projectInviteMessage}
                </div>
              )}
              {projectInviteError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400 animate-fadeIn">
                  {projectInviteError}
                </div>
              )}

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={projectInviteEmail}
                    onChange={(e) => setProjectInviteEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="ui-input w-full px-3.5 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-secondary uppercase tracking-wider mb-1.5">
                    {language === 'vi' ? 'Vai trò dự án' : 'Project Role'}
                  </label>
                  <select
                    value={projectInviteRole}
                    onChange={(e) => setProjectInviteRole(e.target.value)}
                    className="ui-select w-full px-3 py-2 text-xs bg-card border border-border text-foreground rounded-xl focus:outline-none"
                  >
                    <option value="MEMBER">
                      MEMBER ({language === 'vi' ? 'Thành viên đóng góp' : 'Collaborator'})
                    </option>
                    <option value="VIEWER">
                      VIEWER ({language === 'vi' ? 'Người quan sát' : 'Observer'})
                    </option>
                    <option value="ADMIN">
                      ADMIN ({language === 'vi' ? 'Quản trị viên dự án' : 'Project Admin'})
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="ui-btn-secondary px-4 py-2 text-xs font-semibold"
                >
                  {language === 'vi' ? 'Đóng' : 'Close'}
                </button>
                <button
                  type="submit"
                  disabled={projectInviteLoading}
                  className="ui-btn-primary px-5 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  {projectInviteLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/20 border-t-white" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      {language === 'vi' ? 'Gửi lời mời' : 'Send Invitation'}
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-end pt-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={onClose}
                className="ui-btn-secondary px-4 py-2 text-xs font-semibold"
              >
                {language === 'vi' ? 'Đóng' : 'Close'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 6. Image Lightbox Modal
export function ImageLightboxModal({
  previewImage,
  onClose,
}: {
  previewImage: { url: string; name: string } | null;
  onClose: () => void;
}) {
  if (!previewImage) return null;
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between mb-3 text-white">
          <span className="text-sm font-bold truncate max-w-md">{previewImage.name}</span>
          <div className="flex items-center gap-3">
            <a
              href={previewImage.url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 shadow-lg hover:bg-primary/90 transition-all"
            >
              <Download className="h-4 w-4" /> Tải về tệp tin
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-surface border border-border text-secondary hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-border/40 shadow-2xl bg-black/40 flex items-center justify-center max-h-[80vh] w-full p-2">
          { }
          <img
            src={previewImage.url}
            alt={previewImage.name}
            className="max-h-[75vh] max-w-full object-contain rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

// 7. Custom Alert / Confirm Modal
export function CustomDialogModal({
  dialogConfig,
}: {
  dialogConfig: {
    show: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null;
}) {
  if (!dialogConfig || !dialogConfig.show) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 dark:bg-black/75 backdrop-blur-md p-4 animate-fadeIn no-print">
      <div className="bg-card/90 border border-border shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl w-full max-w-lg rounded-3xl overflow-hidden p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200 text-foreground">
        <div className="flex items-center gap-4 border-b border-border/80 pb-4.5">
          <div className="p-3 bg-primary/15 border border-primary/25 rounded-2xl text-primary shrink-0">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-zinc-100 tracking-wide font-display leading-snug">
              {dialogConfig.title}
            </h3>
          </div>
        </div>

        <p className="text-sm font-medium text-zinc-200 leading-relaxed bg-surface/60 border border-border/80 p-5 rounded-2xl">
          {dialogConfig.message}
        </p>

        <div className="flex gap-3 justify-end pt-2">
          {dialogConfig.type === 'confirm' ? (
            <>
              <button
                type="button"
                onClick={dialogConfig.onCancel}
                className="px-5 py-2.5 rounded-xl border border-border hover:bg-hover text-zinc-300 text-xs font-bold transition-all"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={dialogConfig.onConfirm}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold transition-all shadow-lg shadow-primary/25"
              >
                Xác nhận
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={dialogConfig.onConfirm}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-bold transition-all shadow-lg shadow-primary/25"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// 8. Likes Modal
export function LikesModal({
  likesModalConfig,
  onClose,
}: {
  likesModalConfig: {
    isOpen: boolean;
    commentId: string;
    users: { id: string; fullname: string; email: string; avatarUrl: string }[];
  };
  onClose: () => void;
}) {
  if (!likesModalConfig.isOpen) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 dark:bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-card/90 border border-border shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl w-full max-w-sm rounded-3xl overflow-hidden p-6 space-y-4 text-foreground flex flex-col">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <h3 className="text-sm font-extrabold text-zinc-100 tracking-wide font-display flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
            Lượt thích ({likesModalConfig.users.length})
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[300px] overflow-y-auto flex flex-col gap-2 pr-1 scrollbar-thin">
          {likesModalConfig.users.length === 0 ? (
            <div className="text-center text-xs text-muted py-6">
              Chưa có ai thích bình luận này.
            </div>
          ) : (
            likesModalConfig.users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface/60 border border-transparent hover:border-border/50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {u.fullname.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-heading truncate">{u.fullname}</span>
                  <span className="text-[10px] text-muted truncate">{u.email}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
