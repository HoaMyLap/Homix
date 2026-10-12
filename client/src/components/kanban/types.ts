export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  position: number;
  dueDate: string | null;
  assigneeId: string | null;
  creatorId: string | null;
  projectId: string;
  parentTaskId: string | null;
  createdAt: string;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  taskId: string;
  parentCommentId?: string | null;
  replyToUserId?: string | null;
  likedUserIds?: string[];
  createdAt: string;
  updatedAt?: string;
  authorName?: string;
  authorAvatarUrl?: string;
  workspaceRole?: string;
  projectRole?: string;
  isTaskAssignee?: boolean;
}

export interface Member {
  userId: string;
  email: string;
  fullname: string;
  avatarUrl: string;
  role: string;
}

export interface TaskLog {
  id: string;
  taskId: string;
  userId: string | null;
  actionType: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
  folderId?: string;
}

export interface ProjectFolder {
  id: string;
  name: string;
  projectId: string;
  parentId: string | null;
  createdBy: string;
  createdAt: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

export const isImageFile = (type: string, name: string): boolean => {
  if (type && type.startsWith('image/')) return true;
  const ext = name ? name.toLowerCase().split('.').pop() || '' : '';
  return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext);
};

export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const getFileBadgeStyle = (name: string, type: string) => {
  if (isImageFile(type, name)) {
    return { color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', label: 'IMAGE' };
  }
  const ext = name ? name.toLowerCase().split('.').pop() || '' : '';
  if (ext === 'pdf') return { color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', label: 'PDF' };
  if (['xlsx', 'xls', 'csv'].includes(ext)) return { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'EXCEL' };
  if (['docx', 'doc', 'txt'].includes(ext)) return { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'DOC' };
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'ZIP' };
  return { color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', label: ext.toUpperCase() || 'FILE' };
};

export const getPriorityBadgeColor = (p: string): string => {
  switch (p) {
    case 'URGENT': return 'ui-badge ui-badge-urgent';
    case 'HIGH': return 'ui-badge ui-badge-high';
    case 'MEDIUM': return 'ui-badge ui-badge-medium';
    default: return 'ui-badge ui-badge-low';
  }
};
