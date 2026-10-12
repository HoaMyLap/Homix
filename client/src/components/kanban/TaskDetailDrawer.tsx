'use client';

import React from 'react';
import {
  Trash,
  X,
  FileText,
  ListChecks,
  Paperclip,
  History,
  MessageSquare,
  Sparkles,
  CheckSquare,
  Check,
  Upload,
  Eye,
  Download,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  Task,
  Comment,
  Member,
  TaskLog,
  ProjectFile,
  isImageFile,
  formatFileSize,
  getPriorityBadgeColor,
} from './types';
import { TaskDiscussionList, TaskDiscussionFooter, AccessibleDoc } from './TaskDiscussion';

export type DrawerTabType = 'detail' | 'subtasks' | 'files' | 'logs' | 'comments';

interface TaskDetailDrawerProps {
  selectedTask: Task;
  onClose: () => void;
  language: string;
  currentUserId: string;
  canDeleteTask: boolean;
  canEditTask: boolean;
  canCreateComment: boolean;
  canDeleteComment: boolean;
  drawerTab: DrawerTabType;
  setDrawerTab: (tab: DrawerTabType) => void;
  subtasks: Task[];
  taskFiles: ProjectFile[];
  taskLogs: TaskLog[];
  comments: Comment[];
  members: Member[];
  editTitle: string;
  setEditTitle: (val: string) => void;
  editDesc: string;
  setEditDesc: (val: string) => void;
  editPriority: string;
  setEditPriority: (val: string) => void;
  editAssigneeId: string | null;
  setEditAssigneeId: (val: string | null) => void;
  editDueDate: string | null;
  setEditDueDate: (val: string | null) => void;
  onUpdateTaskDetails: (overrides?: {
    title?: string;
    description?: string;
    priority?: string;
    assigneeId?: string | null;
    dueDate?: string | null;
  }) => void;
  onDeleteTask: (taskId: string) => void;
  aiSubtaskLoading: boolean;
  onGenerateAiSubtasks: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  newSubtaskTitle: string;
  setNewSubtaskTitle: (val: string) => void;
  onAddSubtask: (e: React.FormEvent) => void;
  taskFileUploading: boolean;
  onUploadTaskFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteTaskFile: (fileId: string) => void;
  onPreviewImage: (img: { url: string; name: string }) => void;
  getMemberName: (userId: string | null) => string;
  editingCommentId: string | null;
  setEditingCommentId: (val: string | null) => void;
  editCommentContent: string;
  setEditCommentContent: (val: string) => void;
  onSaveEditComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onToggleLikeComment: (commentId: string) => void;
  onViewLikes: (commentId: string) => void;
  replyParentId: string | null;
  setReplyParentId: (val: string | null) => void;
  replyContent: string;
  setReplyContent: (val: string) => void;
  newCommentContent: string;
  setNewCommentContent: (val: string) => void;
  onAddComment: (e: React.FormEvent, targetComment: Comment | null) => void;
  commentShowAttachMenu: boolean;
  setCommentShowAttachMenu: (val: boolean) => void;
  commentIsUploadingFile: boolean;
  onDirectUploadComment: (e: React.ChangeEvent<HTMLInputElement>) => void;
  commentShowFileSelectorModal: boolean;
  setCommentShowFileSelectorModal: (val: boolean) => void;
  commentSearchQuery: string;
  setCommentSearchQuery: (val: string) => void;
  commentIsLoadingDocs: boolean;
  commentAccessibleDocs: AccessibleDoc[];
  onSelectDocToComment: (doc: AccessibleDoc) => void;
}

export default function TaskDetailDrawer({
  selectedTask,
  onClose,
  language,
  currentUserId,
  canDeleteTask,
  canEditTask,
  canCreateComment,
  canDeleteComment,
  drawerTab,
  setDrawerTab,
  subtasks,
  taskFiles,
  taskLogs,
  comments,
  members,
  editTitle,
  setEditTitle,
  editDesc,
  setEditDesc,
  editPriority,
  setEditPriority,
  editAssigneeId,
  setEditAssigneeId,
  editDueDate,
  setEditDueDate,
  onUpdateTaskDetails,
  onDeleteTask,
  aiSubtaskLoading,
  onGenerateAiSubtasks,
  onToggleSubtask,
  onDeleteSubtask,
  newSubtaskTitle,
  setNewSubtaskTitle,
  onAddSubtask,
  taskFileUploading,
  onUploadTaskFile,
  onDeleteTaskFile,
  onPreviewImage,
  getMemberName,
  editingCommentId,
  setEditingCommentId,
  editCommentContent,
  setEditCommentContent,
  onSaveEditComment,
  onDeleteComment,
  onToggleLikeComment,
  onViewLikes,
  replyParentId,
  setReplyParentId,
  replyContent,
  setReplyContent,
  newCommentContent,
  setNewCommentContent,
  onAddComment,
  commentShowAttachMenu,
  setCommentShowAttachMenu,
  commentIsUploadingFile,
  onDirectUploadComment,
  commentShowFileSelectorModal,
  setCommentShowFileSelectorModal,
  commentSearchQuery,
  setCommentSearchQuery,
  commentIsLoadingDocs,
  commentAccessibleDocs,
  onSelectDocToComment,
}: TaskDetailDrawerProps) {
  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg ui-drawer z-50 flex flex-col overflow-hidden bg-card text-foreground shadow-2xl">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4 shrink-0">
        <div className="flex-1 min-w-0 pr-4">
          <h3 className="text-base font-bold font-display text-heading truncate">
            {selectedTask.title}
          </h3>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block ${getPriorityBadgeColor(
              selectedTask.priority
            )}`}
          >
            {selectedTask.priority} · {selectedTask.status.replace('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canDeleteTask && (
            <button
              onClick={() => onDeleteTask(selectedTask.id)}
              className="p-2 text-secondary hover:text-error hover:bg-error-muted rounded-lg transition-colors"
              title="Xóa công việc"
            >
              <Trash className="h-4 w-4" />
            </button>
          )}
          <button onClick={onClose} className="ui-btn-ghost p-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border shrink-0 px-2 overflow-x-auto">
        {(
          [
            { id: 'detail', label: 'Chi tiết', icon: <FileText className="h-3.5 w-3.5" /> },
            {
              id: 'subtasks',
              label: `Subtasks (${subtasks.length})`,
              icon: <ListChecks className="h-3.5 w-3.5" />,
            },
            {
              id: 'files',
              label: `Tệp (${taskFiles.length})`,
              icon: <Paperclip className="h-3.5 w-3.5" />,
            },
            { id: 'logs', label: 'Lịch sử', icon: <History className="h-3.5 w-3.5" /> },
            {
              id: 'comments',
              label: `Thảo luận (${comments.length})`,
              icon: <MessageSquare className="h-3.5 w-3.5" />,
            },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setDrawerTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-[11px] font-semibold border-b-2 transition-colors whitespace-nowrap ${
              drawerTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-secondary hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Drawer Body — scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* ===== TAB: Chi tiết ===== */}
        {drawerTab === 'detail' && (
          <>
            <div>
              <label className="ui-label">Tiêu đề</label>
              <input
                type="text"
                value={editTitle}
                disabled={!canEditTask}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={() => onUpdateTaskDetails()}
                className="ui-input px-4 py-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="ui-label">Mô tả công việc</label>
              <textarea
                value={editDesc}
                disabled={!canEditTask}
                onChange={(e) => setEditDesc(e.target.value)}
                onBlur={() => onUpdateTaskDetails()}
                rows={3}
                className="ui-input px-4 py-2.5 text-sm resize-none disabled:opacity-75 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="ui-label">Độ ưu tiên</label>
                <select
                  value={editPriority}
                  disabled={!canEditTask}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditPriority(val);
                    onUpdateTaskDetails({ priority: val });
                  }}
                  className="ui-input px-3 py-2 text-xs disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <option value="LOW">LOW (Thấp)</option>
                  <option value="MEDIUM">MEDIUM (Trung bình)</option>
                  <option value="HIGH">HIGH (Cao)</option>
                  <option value="URGENT">URGENT (Khẩn cấp)</option>
                </select>
              </div>
              <div>
                <label className="ui-label">Trạng thái</label>
                <div className="bg-surface border border-border rounded-xl px-3 py-2 text-xs text-body capitalize">
                  {selectedTask.status.replace('_', ' ').toLowerCase()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="ui-label">Người thực hiện</label>
                <select
                  value={editAssigneeId || ''}
                  disabled={!canEditTask}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    setEditAssigneeId(val);
                    onUpdateTaskDetails({ assigneeId: val });
                  }}
                  className="ui-input px-3 py-2 text-xs disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  <option value="">Chưa phân công</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.fullname}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="ui-label">Hạn chót</label>
                <input
                  type="datetime-local"
                  value={editDueDate || ''}
                  disabled={!canEditTask}
                  onChange={(e) => {
                    const val = e.target.value || null;
                    setEditDueDate(val);
                    onUpdateTaskDetails({
                      dueDate: val ? new Date(val).toISOString() : null,
                    });
                  }}
                  className="ui-input px-3 py-2 text-xs disabled:opacity-75 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </>
        )}

        {/* ===== TAB: Subtasks ===== */}
        {drawerTab === 'subtasks' && (
          <>
            {subtasks.length > 0 &&
              (() => {
                const doneCount = subtasks.filter((s) => s.status === 'DONE').length;
                const pct = Math.round((doneCount / subtasks.length) * 100);
                return (
                  <div className="bg-surface border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-heading">Tiến độ subtasks</span>
                      <span className="text-xs font-bold text-primary">
                        {doneCount}/{subtasks.length} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })()}

            {canEditTask && (
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={aiSubtaskLoading}
                  onClick={onGenerateAiSubtasks}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-[10px] font-bold transition-all disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {aiSubtaskLoading ? 'Đang tạo...' : 'Gợi ý bằng AI ✨'}
                </button>
              </div>
            )}

            <div className="space-y-2">
              {subtasks.length === 0 && (
                <div className="text-center py-8 text-secondary text-xs">
                  <CheckSquare className="h-8 w-8 mx-auto mb-2 text-muted" />
                  Chưa có công việc con nào. Thêm thủ công hoặc dùng AI.
                </div>
              )}
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    sub.status === 'DONE'
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-surface border-border hover:border-border-focus'
                  }`}
                >
                  <button
                    onClick={() => onToggleSubtask(sub.id)}
                    disabled={!canEditTask}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      sub.status === 'DONE'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-border hover:border-primary'
                    } ${!canEditTask ? 'cursor-not-allowed opacity-75' : ''}`}
                  >
                    {sub.status === 'DONE' && <Check className="h-3 w-3" />}
                  </button>
                  <span
                    className={`text-xs flex-1 ${
                      sub.status === 'DONE' ? 'line-through text-muted' : 'text-body'
                    }`}
                  >
                    {sub.title}
                  </span>
                  {canEditTask && (
                    <button
                      onClick={() => onDeleteSubtask(sub.id)}
                      className="text-muted hover:text-error transition-colors p-1 rounded"
                      title="Xóa công việc con"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {canEditTask && (
              <form onSubmit={onAddSubtask} className="flex gap-2 pt-2">
                <input
                  type="text"
                  required
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Thêm công việc con mới..."
                  className="ui-input flex-1 px-3 py-2 text-xs"
                />
                <button type="submit" className="ui-btn-primary px-3 py-2 text-xs">
                  Thêm
                </button>
              </form>
            )}
          </>
        )}

        {/* ===== TAB: Tệp đính kèm ===== */}
        {drawerTab === 'files' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-heading">
                Tệp đính kèm công việc ({taskFiles.length})
              </h4>
              {canEditTask && (
                <label className="ui-btn-primary px-3 py-1.5 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Upload className="h-3.5 w-3.5" />
                  {taskFileUploading ? 'Đang tải...' : '+ Tải tệp lên'}
                  <input
                    type="file"
                    multiple
                    onChange={onUploadTaskFile}
                    disabled={taskFileUploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {taskFiles.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border rounded-xl text-secondary text-xs">
                <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted opacity-60" />
                Chưa có tệp đính kèm nào cho công việc này.
              </div>
            ) : (
              <div className="space-y-3">
                {taskFiles.map((file) => {
                  const isImg = isImageFile(file.type, file.name);
                  return (
                    <div
                      key={file.id}
                      className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm hover:border-primary/40 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {isImg ? (
                          <div
                            className="w-12 h-12 rounded-lg bg-black/40 border border-border overflow-hidden shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => onPreviewImage({ url: file.url, name: file.name })}
                          >
                            { }
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-heading truncate" title={file.name}>
                            {file.name}
                          </h5>
                          <p className="text-[10px] text-muted mt-0.5">
                            {formatFileSize(file.size)} ·{' '}
                            {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isImg && (
                          <button
                            type="button"
                            onClick={() => onPreviewImage({ url: file.url, name: file.name })}
                            className="p-1.5 rounded-lg bg-card border border-border text-secondary hover:text-primary transition-colors"
                            title="Xem ảnh"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="p-1.5 rounded-lg bg-card border border-border text-secondary hover:text-primary transition-colors"
                          title="Tải về"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                        {canEditTask && (
                          <button
                            type="button"
                            onClick={() => onDeleteTaskFile(file.id)}
                            className="p-1.5 rounded-lg bg-card border border-border text-muted hover:text-rose-400 transition-colors"
                            title="Xóa tệp"
                          >
                            <Trash className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== TAB: Lịch sử hoạt động ===== */}
        {drawerTab === 'logs' && (
          <>
            {taskLogs.length === 0 ? (
              <div className="text-center py-10 text-secondary text-xs">
                <History className="h-8 w-8 mx-auto mb-2 text-muted" />
                Chưa có hoạt động nào được ghi nhận.
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                <div className="space-y-4">
                  {taskLogs.map((log) => (
                    <div key={log.id} className="flex gap-4 items-start relative">
                      <div
                        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center z-10 ${
                          log.actionType === 'CREATE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : log.actionType === 'DELETE'
                            ? 'bg-red-500/20 text-red-400'
                            : log.actionType === 'UPDATE_STATUS'
                            ? 'bg-violet-500/20 text-violet-400'
                            : log.actionType.includes('AI')
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {log.actionType === 'CREATE' && <CheckCircle2 className="h-4 w-4" />}
                        {log.actionType === 'DELETE' && <Trash className="h-4 w-4" />}
                        {log.actionType === 'UPDATE_STATUS' && <ChevronRight className="h-4 w-4" />}
                        {log.actionType === 'UPDATE' && <AlertCircle className="h-4 w-4" />}
                        {log.actionType.includes('AI') && <Sparkles className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 bg-surface border border-border rounded-xl p-3 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-heading">
                            {log.actionType === 'CREATE' && 'Tạo công việc'}
                            {log.actionType === 'DELETE' && 'Xóa công việc'}
                            {log.actionType === 'UPDATE_STATUS' && 'Cập nhật trạng thái'}
                            {log.actionType === 'UPDATE' && 'Chỉnh sửa nội dung'}
                            {log.actionType === 'AI_SUBTASKS_GEN' && 'AI tạo subtask'}
                            {![
                              'CREATE',
                              'DELETE',
                              'UPDATE_STATUS',
                              'UPDATE',
                              'AI_SUBTASKS_GEN',
                            ].includes(log.actionType) && log.actionType}
                          </span>
                          <span className="text-[10px] text-muted">
                            {new Date(log.createdAt).toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </span>
                        </div>
                        {log.actionType === 'UPDATE_STATUS' && log.oldValue && log.newValue && (
                          <div className="flex items-center gap-1.5 mt-1 text-secondary">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px]">
                              {log.oldValue}
                            </span>
                            <ChevronRight className="h-3 w-3" />
                            <span className="px-1.5 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-semibold">
                              {log.newValue}
                            </span>
                          </div>
                        )}
                        {log.newValue && log.actionType !== 'UPDATE_STATUS' && (
                          <p className="text-secondary mt-1">{log.newValue}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ===== TAB: Thảo luận ===== */}
        {drawerTab === 'comments' && (
          <TaskDiscussionList
            currentUserId={currentUserId}
            canCreateComment={canCreateComment}
            canDeleteComment={canDeleteComment}
            comments={comments}
            getMemberName={getMemberName}
            editingCommentId={editingCommentId}
            setEditingCommentId={setEditingCommentId}
            editCommentContent={editCommentContent}
            setEditCommentContent={setEditCommentContent}
            onSaveEditComment={onSaveEditComment}
            onDeleteComment={onDeleteComment}
            onToggleLikeComment={onToggleLikeComment}
            onViewLikes={onViewLikes}
            replyParentId={replyParentId}
            setReplyParentId={setReplyParentId}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            onAddComment={onAddComment}
          />
        )}
      </div>

      {/* Fixed Footer for Comments Input */}
      {drawerTab === 'comments' && (
        <TaskDiscussionFooter
          language={language}
          canCreateComment={canCreateComment}
          newCommentContent={newCommentContent}
          setNewCommentContent={setNewCommentContent}
          onAddComment={onAddComment}
          commentShowAttachMenu={commentShowAttachMenu}
          setCommentShowAttachMenu={setCommentShowAttachMenu}
          commentIsUploadingFile={commentIsUploadingFile}
          onDirectUploadComment={onDirectUploadComment}
          commentShowFileSelectorModal={commentShowFileSelectorModal}
          setCommentShowFileSelectorModal={setCommentShowFileSelectorModal}
          commentSearchQuery={commentSearchQuery}
          setCommentSearchQuery={setCommentSearchQuery}
          commentIsLoadingDocs={commentIsLoadingDocs}
          commentAccessibleDocs={commentAccessibleDocs}
          onSelectDocToComment={onSelectDocToComment}
        />
      )}
    </div>
  );
}
