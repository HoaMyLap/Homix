'use client';

import React from 'react';
import {
  FileText,
  Download,
  Clock,
  Edit2,
  Trash,
  Heart,
  CornerDownRight,
  MessageSquare,
  Paperclip,
  Upload,
  FolderOpen,
  Send,
  X,
  Search,
  Image as ImageIcon,
} from 'lucide-react';
import { Comment } from './types';

export interface AccessibleDoc {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  source?: string;
}

interface TaskDiscussionProps {
  language: string;
  currentUserId: string;
  canCreateComment: boolean;
  canDeleteComment: boolean;
  comments: Comment[];
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

export function TaskDiscussionList({
  currentUserId,
  canCreateComment,
  canDeleteComment,
  comments,
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
  onAddComment,
}: Omit<
  TaskDiscussionProps,
  | 'language'
  | 'newCommentContent'
  | 'setNewCommentContent'
  | 'commentShowAttachMenu'
  | 'setCommentShowAttachMenu'
  | 'commentIsUploadingFile'
  | 'onDirectUploadComment'
  | 'commentShowFileSelectorModal'
  | 'setCommentShowFileSelectorModal'
  | 'commentSearchQuery'
  | 'setCommentSearchQuery'
  | 'commentIsLoadingDocs'
  | 'commentAccessibleDocs'
  | 'onSelectDocToComment'
>) {
  const getRoleBadge = (comment: Comment) => {
    if (comment.isTaskAssignee) {
      return (
        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Người thực hiện
        </span>
      );
    }
    if (comment.workspaceRole === 'ADMIN') {
      return (
        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Admin Workspace
        </span>
      );
    }
    if (comment.projectRole === 'ADMIN') {
      return (
        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
          Admin Dự án
        </span>
      );
    }
    if (
      comment.workspaceRole &&
      comment.workspaceRole !== 'MEMBER' &&
      comment.workspaceRole !== 'VIEWER'
    ) {
      return (
        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
          {comment.workspaceRole}
        </span>
      );
    }
    return null;
  };

  const renderCommentContent = (content: string) => {
    if (content && content.startsWith('{') && content.endsWith('}')) {
      try {
        const payload = JSON.parse(content);
        if (payload.attachmentType === 'image') {
          return (
            <div className="space-y-2 p-1 max-w-[320px]">
              {payload.text && <p className="mb-2">{payload.text}</p>}
              <a
                href={payload.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg border border-border"
              >
                { }
                <img
                  src={payload.fileUrl}
                  alt={payload.fileName}
                  className="max-w-full max-h-[220px] object-cover hover:scale-[1.02] transition-transform rounded-lg"
                />
              </a>
              <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-1 border-t border-border-subtle/40 mt-1">
                <span className="truncate max-w-[180px]">{payload.fileName}</span>
                <span>({(payload.fileSize / 1024).toFixed(1)} KB)</span>
              </div>
            </div>
          );
        } else if (payload.attachmentType === 'file') {
          return (
            <div className="flex flex-col gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-border-subtle/50 max-w-[320px]">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-xs truncate text-heading" title={payload.fileName}>
                    {payload.fileName}
                  </p>
                  <p className="text-[9px] text-muted">
                    {(payload.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 border-t border-border-subtle/55 pt-2 mt-1">
                <a
                  href={payload.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1 text-[10px] font-black text-center rounded-lg flex items-center justify-center gap-1 border-0 cursor-pointer text-white bg-primary hover:bg-primary/90 hover:scale-102 transition-all no-underline"
                >
                  <Download className="h-3 w-3" /> Tải xuống
                </a>
              </div>
            </div>
          );
        }
      } catch {
        // Fallback to plain text
      }
    }
    return <span className="whitespace-pre-wrap">{content}</span>;
  };

  const renderCommentItem = (comment: Comment) => {
    const isOwner = comment.userId === currentUserId;
    const liked = comment.likedUserIds?.includes(currentUserId);
    const likesCount = comment.likedUserIds?.length || 0;
    const authorName = getMemberName(comment.userId);

    return (
      <div
        id={`comment-${comment.id}`}
        key={comment.id}
        className="p-3.5 bg-surface border border-border rounded-xl flex flex-col gap-2 shadow-sm transition-all duration-300"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-wrap gap-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
              {authorName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-bold text-heading">{authorName}</span>
            {getRoleBadge(comment)}
            {comment.replyToUserId && (
              <span className="text-[10px] text-primary/80 font-bold bg-primary/5 border border-primary/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                Đã trả lời @{getMemberName(comment.replyToUserId)}
              </span>
            )}
            <span className="text-[10px] text-muted flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(comment.createdAt).toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
              })}
            </span>
          </div>

          {editingCommentId !== comment.id && (
            <div className="flex items-center gap-1">
              {isOwner && canCreateComment && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCommentId(comment.id);
                    setEditCommentContent(comment.content);
                  }}
                  className="text-muted hover:text-primary p-1 rounded transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              )}
              {isOwner && canDeleteComment && (
                <button
                  type="button"
                  onClick={() => onDeleteComment(comment.id)}
                  className="text-muted hover:text-error p-1 rounded transition-colors"
                  title="Xóa"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {editingCommentId === comment.id ? (
          <div className="flex flex-col gap-2 mt-1">
            <textarea
              value={editCommentContent}
              onChange={(e) => setEditCommentContent(e.target.value)}
              rows={2}
              className="ui-input p-2.5 text-xs resize-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingCommentId(null)}
                className="ui-btn-secondary px-2.5 py-1 text-[11px]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => onSaveEditComment(comment.id)}
                className="ui-btn-primary px-3 py-1 text-[11px] font-semibold"
              >
                Lưu
              </button>
            </div>
          </div>
        ) : (
          <div className="text-body text-xs leading-relaxed">
            {renderCommentContent(comment.content)}
          </div>
        )}

        <div className="flex items-center gap-4 pt-1.5 border-t border-border-subtle mt-1 text-[11px] text-muted">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleLikeComment(comment.id)}
              className={`flex items-center gap-1 font-semibold transition-colors ${
                liked ? 'text-rose-500' : 'hover:text-foreground'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
              <span>{liked ? 'Đã thích' : 'Thích'}</span>
            </button>
            {likesCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewLikes(comment.id);
                }}
                className="hover:underline hover:text-foreground font-semibold px-1.5 py-0.5 bg-surface-hover rounded"
                title="Xem những người đã thích"
              >
                ({likesCount})
              </button>
            )}
          </div>

          {canCreateComment && (
            <button
              type="button"
              onClick={() => {
                setReplyParentId(replyParentId === comment.id ? null : comment.id);
                setReplyContent('');
              }}
              className="flex items-center gap-1 font-semibold hover:text-foreground transition-colors"
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              <span>Trả lời</span>
            </button>
          )}
        </div>

        {replyParentId === comment.id && (
          <form onSubmit={(e) => onAddComment(e, comment)} className="flex gap-2 pt-2 mt-1">
            <input
              type="text"
              required
              autoFocus
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Trả lời ${authorName}...`}
              className="ui-input flex-1 px-3 py-1.5 text-xs"
            />
            <button
              type="submit"
              className="ui-btn-primary px-3 py-1.5 text-xs font-semibold shrink-0"
            >
              Trả lời
            </button>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-4">
      {comments.length === 0 && (
        <div className="text-center py-10 text-secondary text-xs">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted" />
          Chưa có bình luận nào. Hãy là người đầu tiên trao đổi!
        </div>
      )}

      {comments
        .filter((c) => !c.parentCommentId)
        .map((comment) => {
          const replies = comments.filter((c) => c.parentCommentId === comment.id);
          return (
            <div key={comment.id} className="space-y-2">
              {renderCommentItem(comment)}

              {replies.length > 0 && (
                <div className="ml-5 pl-3 border-l-2 border-primary/20 space-y-2">
                  {replies.map((reply) => renderCommentItem(reply))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

export function TaskDiscussionFooter({
  language,
  canCreateComment,
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
}: Pick<
  TaskDiscussionProps,
  | 'language'
  | 'canCreateComment'
  | 'newCommentContent'
  | 'setNewCommentContent'
  | 'onAddComment'
  | 'commentShowAttachMenu'
  | 'setCommentShowAttachMenu'
  | 'commentIsUploadingFile'
  | 'onDirectUploadComment'
  | 'commentShowFileSelectorModal'
  | 'setCommentShowFileSelectorModal'
  | 'commentSearchQuery'
  | 'setCommentSearchQuery'
  | 'commentIsLoadingDocs'
  | 'commentAccessibleDocs'
  | 'onSelectDocToComment'
>) {
  return (
    <div className="shrink-0 border-t border-border px-6 py-4 bg-card/95 backdrop-blur-sm z-10">
      {!canCreateComment ? (
        <div className="p-3 bg-zinc-900/60 border border-border/80 text-xs text-muted text-center rounded-xl">
          {language === 'vi'
            ? '🔒 Bạn không có quyền bình luận trong công việc này.'
            : '🔒 You do not have permission to comment in this task.'}
        </div>
      ) : (
        <form
          onSubmit={(e) => onAddComment(e, null)}
          className="flex gap-2 items-center relative w-full"
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => setCommentShowAttachMenu(!commentShowAttachMenu)}
              className="h-9 w-9 rounded-xl bg-zinc-200 hover:bg-zinc-350 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-650 dark:text-zinc-300 flex items-center justify-center shrink-0 border-0 cursor-pointer transition-all"
              title="Đính kèm tài liệu/hình ảnh"
            >
              <Paperclip className="h-4 w-4" />
            </button>
            {commentShowAttachMenu && (
              <div className="absolute bottom-11 left-0 z-50 w-44 bg-white dark:bg-[#1a1626] border border-[#e1dbe9] dark:border-[#221c2e] rounded-xl shadow-xl p-1.5 flex flex-col gap-1 text-[11px] text-zinc-700 dark:text-zinc-200">
                <label className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-primary/5 rounded-lg cursor-pointer font-bold w-full">
                  <Upload className="h-3.5 w-3.5 text-primary" />
                  {commentIsUploadingFile ? 'Đang tải...' : 'Tải lên từ máy'}
                  <input
                    type="file"
                    className="hidden"
                    onChange={onDirectUploadComment}
                    disabled={commentIsUploadingFile}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setCommentShowFileSelectorModal(true)}
                  className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-primary/5 rounded-lg border-0 bg-transparent text-left cursor-pointer font-bold text-zinc-700 dark:text-zinc-200 w-full"
                >
                  <FolderOpen className="h-3.5 w-3.5 text-indigo-400" />
                  Chọn từ kho tài liệu
                </button>
              </div>
            )}
          </div>

          <input
            type="text"
            required
            value={newCommentContent}
            onChange={(e) => setNewCommentContent(e.target.value)}
            placeholder="Viết bình luận mới..."
            className="ui-input flex-1 px-3.5 py-2.5 text-xs bg-surface border border-border"
          />
          <button
            type="submit"
            className="ui-btn-primary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 shrink-0 border-0 rounded-xl cursor-pointer text-white bg-primary"
          >
            <Send className="h-3.5 w-3.5" />
            Gửi
          </button>

          {commentShowFileSelectorModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-[#f4f2f7] dark:bg-[#0e0c14] border border-[#e1dbe9] dark:border-[#221c2e] w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-heading">
                    Chọn tài liệu đính kèm thảo luận
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCommentShowFileSelectorModal(false)}
                    className="p-1 rounded hover:bg-muted text-muted hover:text-foreground border-0 bg-transparent cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={commentSearchQuery}
                    onChange={(e) => setCommentSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm tài liệu..."
                    className="ui-input w-full pl-9 pr-3.5 py-1.5 text-xs bg-white dark:bg-[#1a1626] border border-[#cbd3e3] dark:border-[#353043] rounded-xl focus:outline-none"
                  />
                  <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-muted" />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1.5 scrollbar-thin">
                  {commentIsLoadingDocs ? (
                    <div className="flex flex-col items-center justify-center py-8 text-zinc-500 text-xs gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary/20 border-t-primary" />
                      Đang tải tài liệu...
                    </div>
                  ) : commentAccessibleDocs.length === 0 ? (
                    <div className="text-center py-8 text-zinc-400 text-xs">
                      Không tìm thấy tài liệu nào trong kho lưu trữ.
                    </div>
                  ) : (
                    commentAccessibleDocs
                      .filter((d) =>
                        d.name.toLowerCase().includes(commentSearchQuery.toLowerCase())
                      )
                      .map((doc) => {
                        const isImg = doc.type && doc.type.startsWith('image/');
                        return (
                          <div
                            key={doc.id}
                            onClick={() => onSelectDocToComment(doc)}
                            className="p-3 bg-white dark:bg-[#1a1626] border border-[#e1dbe9]/80 dark:border-[#221c2e]/85 rounded-xl hover:border-primary/50 cursor-pointer flex items-center justify-between group transition-all active:scale-[0.99]"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isImg ? (
                                <ImageIcon className="h-7 w-7 text-indigo-400 shrink-0" />
                              ) : (
                                <FileText className="h-7 w-7 text-blue-400 shrink-0" />
                              )}
                              <div className="min-w-0">
                                <h5
                                  className="text-[11px] font-bold text-heading truncate"
                                  title={doc.name}
                                >
                                  {doc.name}
                                </h5>
                                <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 mt-0.5">
                                  <span>{(doc.size / 1024).toFixed(1)} KB</span>
                                  <span>•</span>
                                  <span className="truncate max-w-[150px] italic">
                                    {doc.source}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold text-primary group-hover:underline opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              Đính kèm
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setCommentShowFileSelectorModal(false)}
                    className="ui-btn-secondary px-4 py-2 text-xs font-bold rounded-xl border border-border cursor-pointer bg-transparent"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </div>
  );
}

export default TaskDiscussionList;
