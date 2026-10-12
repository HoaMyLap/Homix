'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useProjectSocket } from '@/hooks/useProjectSocket';
import Sidebar from '@/components/Sidebar';
import ChatWidget from '@/components/ChatWidget';
import { useLanguage } from '@/lib/i18n';
import * as XLSX from 'xlsx';

import {
  Task,
  Comment,
  Member,
  TaskLog,
  ProjectFile,
  ProjectFolder,
} from '@/components/kanban/types';
import KanbanHeader from '@/components/kanban/KanbanHeader';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import ProjectFilesManager from '@/components/kanban/ProjectFilesManager';
import TaskDetailDrawer, { DrawerTabType } from '@/components/kanban/TaskDetailDrawer';
import AiReportModal from '@/components/kanban/AiReportModal';
import {
  CreateTaskModal,
  AiSmartSearchModal,
  AiSubtaskModal,
  ExcelImportModal,
  ProjectMembersModal,
  ImageLightboxModal,
  CustomDialogModal,
  LikesModal,
} from '@/components/kanban/ProjectModals';

interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  workspaceId: string;
}

interface WorkspaceMemberInfo {
  userId: string;
  role: string;
  customRoleName?: string;
}

interface CustomRoleInfo {
  id: string;
  name: string;
  permissions: string[];
}

interface PermissionOverrideInfo {
  permission: string;
  allowed: boolean;
}

export default function ProjectKanbanPage() {
  const router = useRouter();
  const { projectId } = useParams() as { projectId: string };
  const searchParams = useSearchParams();
  const { t, language } = useLanguage();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || '';
    }
    return '';
  });
  const [workspaceId, setWorkspaceId] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [activeChat, setActiveChat] = useState<'WORKSPACE' | 'PROJECT' | null>(null);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [currentUserWorkspaceMember, setCurrentUserWorkspaceMember] =
    useState<WorkspaceMemberInfo | null>(null);
  const [customRoles, setCustomRoles] = useState<CustomRoleInfo[]>([]);
  const [myOverrides, setMyOverrides] = useState<PermissionOverrideInfo[]>([]);
  const [highlightCommentId, setHighlightCommentId] = useState<string | null>(null);

  // Custom dialog modal states
  const [dialogConfig, setDialogConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm?: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showCustomConfirm = (message: string, onConfirm: () => void) => {
    setDialogConfig({
      show: true,
      title: 'Xác nhận',
      message,
      type: 'confirm',
      onConfirm: () => {
        onConfirm();
        setDialogConfig(null);
      },
      onCancel: () => setDialogConfig(null),
    });
  };

  const showCustomAlert = (message: string) => {
    setDialogConfig({
      show: true,
      title: 'Thông báo',
      message,
      type: 'alert',
      onConfirm: () => setDialogConfig(null),
    });
  };

  const [showProjectMembersModal, setShowProjectMembersModal] = useState(false);
  const [projectInviteEmail, setProjectInviteEmail] = useState('');
  const [projectInviteRole, setProjectInviteRole] = useState('MEMBER');
  const [projectInviteLoading, setProjectInviteLoading] = useState(false);
  const [projectInviteMessage, setProjectInviteMessage] = useState('');
  const [projectInviteError, setProjectInviteError] = useState('');

  // One-time cleanup: remove ALL stale localStorage file caches from old code version
  useEffect(() => {
    const keysToDelete: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('homix_project_files_') || key.startsWith('homix_task_files_'))) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach((key) => localStorage.removeItem(key));
  }, []);

  // Project Files tab state
  const [projectTab, setProjectTab] = useState<'KANBAN' | 'FILES'>('KANBAN');
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [projectFolders, setProjectFolders] = useState<ProjectFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<Array<{ id: string; name: string }>>([]);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(
    null
  );
  const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // New Task Modal State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [modalStatus, setModalStatus] = useState('TODO');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState('');

  // Drawer / Detail state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [likesModalConfig, setLikesModalConfig] = useState<{
    isOpen: boolean;
    commentId: string;
    users: { id: string; fullname: string; email: string; avatarUrl: string }[];
  }>({ isOpen: false, commentId: '', users: [] });

  // Edit Task State
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('MEDIUM');
  const [editAssigneeId, setEditAssigneeId] = useState<string | null>(null);
  const [editDueDate, setEditDueDate] = useState<string | null>(null);

  // Drawer Tab
  const [drawerTab, setDrawerTab] = useState<DrawerTabType>('detail');
  const [taskFiles, setTaskFiles] = useState<ProjectFile[]>([]);
  const [taskFileUploading, setTaskFileUploading] = useState(false);
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([]);

  // Comments Reply & Edit States
  const [replyParentId, setReplyParentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  // Comment Attachment States
  const [commentShowAttachMenu, setCommentShowAttachMenu] = useState(false);
  const [commentShowFileSelectorModal, setCommentShowFileSelectorModal] = useState(false);
  const [commentSearchQuery, setCommentSearchQuery] = useState('');
  const [commentIsUploadingFile, setCommentIsUploadingFile] = useState(false);
  const [commentAccessibleDocs, setCommentAccessibleDocs] = useState<
    Array<{ id: string; name: string; url: string; size: number; type: string; source?: string }>
  >([]);
  const [commentIsLoadingDocs, setCommentIsLoadingDocs] = useState(false);

  // AI Loading & Modal States
  const [aiSubtaskLoading, setAiSubtaskLoading] = useState(false);
  const [showAiSubtaskModal, setShowAiSubtaskModal] = useState(false);
  const [aiSubtaskSuggestions, setAiSubtaskSuggestions] = useState<
    Array<{ title: string; selected: boolean }>
  >([]);
  const [aiSubtaskAdding, setAiSubtaskAdding] = useState(false);
  const [showAiSummaryModal, setShowAiSummaryModal] = useState(false);
  const [aiSummaryContent, setAiSummaryContent] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [isReportStale, setIsReportStale] = useState(true);

  // AI Smart Search States
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearchLoading, setAiSearchLoading] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<
    Array<{ task: Task; relevanceScore: number; reason: string }>
  >([]);
  const [showAiSearchModal, setShowAiSearchModal] = useState(false);
  const [aiSearchError, setAiSearchError] = useState('');

  // Excel Task Import Modal state
  const [showExcelTaskModal, setShowExcelTaskModal] = useState(false);
  const [excelTasks, setExcelTasks] = useState<
    Array<{ title: string; description: string; status: string; priority: string; projectId: string }>
  >([]);
  const [excelTaskFileName, setExcelTaskFileName] = useState<string>('');
  const [excelTaskLoading, setExcelTaskLoading] = useState(false);
  const [excelTaskError, setExcelTaskError] = useState('');
  const excelTaskFileInputRef = useRef<HTMLInputElement | null>(null);

  const isWorkspaceAdmin = currentUserWorkspaceMember?.role === 'ADMIN';
  const myProjectMember = members.find((m) => m.userId === currentUserId);
  const projectRole = myProjectMember?.role;
  const isViewer =
    !isWorkspaceAdmin &&
    (projectRole === 'VIEWER' ||
      (currentUserWorkspaceMember?.role === 'VIEWER' && !projectRole) ||
      (!projectRole &&
        currentUserWorkspaceMember?.role !== 'ADMIN' &&
        currentUserWorkspaceMember?.role !== 'MEMBER'));

  const checkPermission = (permKey: string): boolean => {
    const override = myOverrides.find((o) => o.permission === permKey);
    if (override !== undefined) {
      return override.allowed;
    }
    if (isWorkspaceAdmin) return true;
    const myRole = currentUserWorkspaceMember?.customRoleName;
    const customRole = customRoles.find((r) => r.name === myRole);
    if (customRole) {
      return customRole.permissions.includes(permKey);
    }
    const sysRole = currentUserWorkspaceMember?.role;
    if (sysRole === 'ADMIN') return true;
    if (sysRole === 'MEMBER') {
      return [
        'PROJECT_VIEW',
        'TASK_CREATE',
        'TASK_UPDATE',
        'TASK_DELETE',
        'TASK_COMMENT_CREATE',
        'TASK_COMMENT_DELETE',
      ].includes(permKey);
    }
    return ['PROJECT_VIEW', 'TASK_VIEW'].includes(permKey);
  };

  const canEditTask = !isViewer && checkPermission('TASK_UPDATE');
  const canCreateTask = !isViewer && checkPermission('TASK_CREATE');
  const canDeleteTask = !isViewer && checkPermission('TASK_DELETE');
  const canInviteToProject =
    isWorkspaceAdmin || projectRole === 'ADMIN' || checkPermission('PROJECT_UPDATE');
  const canUpdateProject = !isViewer && checkPermission('PROJECT_UPDATE');

  // Load project files from Backend API
  const loadProjectFiles = useCallback(
    async (folderId: string | null = currentFolderId) => {
      if (!projectId) return;
      try {
        localStorage.removeItem(`homix_project_files_${projectId}`);
        const [files, folders] = await Promise.all([
          api.projects.getFiles(projectId, folderId),
          api.projects.getFolders(projectId, folderId),
        ]);
        setProjectFiles(files || []);
        setProjectFolders(folders || []);
      } catch (e) {
        console.error('Lỗi khi tải danh sách file từ backend:', e);
      }
    },
    [projectId, currentFolderId]
  );

  const loadTasks = useCallback(async () => {
    try {
      const data = await api.tasks.list(projectId);
      setTasks(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [projectId]);

  const loadTaskDetails = useCallback(async (taskId: string) => {
    try {
      const [commentData, subtaskData, logData] = await Promise.all([
        api.comments.list(taskId),
        api.tasks.getSubtasks(taskId),
        api.tasks.getLogs(taskId),
      ]);
      setComments(commentData || []);
      setSubtasks(subtaskData || []);
      setTaskLogs(logData || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const requestProjectDetails = useCallback(async () => {
    try {
      const proj = await api.projects.get(projectId);
      if (proj) {
        setProject(proj);
        if (proj.workspaceId) {
          setWorkspaceId(proj.workspaceId);
          try {
            const myUid = localStorage.getItem('userId') || '';
            const [wsList, wsMembers, rolesData, myPermOverrides] = await Promise.all([
              api.workspaces.list().catch(() => []),
              api.workspaces.getMembers(proj.workspaceId),
              api.workspaces.getRoles(proj.workspaceId).catch(() => []),
              myUid
                ? api.workspaces.getMemberPermissions(proj.workspaceId, myUid).catch(() => [])
                : Promise.resolve([]),
            ]);

            const myWsMem = (wsMembers || []).find(
              (m: WorkspaceMemberInfo) => m.userId === myUid
            );
            setCurrentUserWorkspaceMember(myWsMem || null);
            setCustomRoles(rolesData || []);
            setMyOverrides((myPermOverrides as PermissionOverrideInfo[]) || []);
            const currentWs = (wsList || []).find(
              (w: { id: string; name: string }) => w.id === proj.workspaceId
            );
            if (currentWs) {
              setWorkspaceName(currentWs.name);
            }
          } catch (err) {
            console.error('Failed to load workspace roles and permissions:', err);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
    }
  }, [projectId]);

  // Folder helper operations
  const handleOpenFolder = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setFolderPath((prev) => [...prev, { id: folderId, name: folderName }]);
  };

  const handleNavigateBreadcrumb = (folderId: string | null, index: number) => {
    setCurrentFolderId(folderId);
    if (folderId === null) {
      setFolderPath([]);
    } else {
      setFolderPath((prev) => prev.slice(0, index + 1));
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !projectId || isViewer) return;
    try {
      setCreatingFolder(true);
      await api.projects.createFolder(projectId, {
        name: newFolderName.trim(),
        parentId: currentFolderId,
      });
      setNewFolderName('');
      setShowCreateFolderDialog(false);
      await loadProjectFiles(currentFolderId);
    } catch (err) {
      console.error('Lỗi khi tạo thư mục:', err);
      showCustomAlert('Lỗi khi tạo thư mục. Vui lòng thử lại.');
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    if (!projectId || isViewer) return;
    showCustomConfirm(
      `Bạn có chắc chắn muốn xóa thư mục "${folderName}"? Hành động này sẽ xóa vĩnh viễn toàn bộ thư mục con và tệp tin bên trong thư mục này.`,
      async () => {
        try {
          await api.projects.deleteFolder(projectId, folderId);
          await loadProjectFiles(currentFolderId);
        } catch (err) {
          console.error('Lỗi khi xóa thư mục:', err);
          showCustomAlert('Không thể xóa thư mục. Vui lòng thử lại sau.');
        }
      }
    );
  };

  useEffect(() => {
    if (projectId && projectTab === 'FILES') {
      loadProjectFiles(currentFolderId);
    }
  }, [currentFolderId, projectTab, projectId, loadProjectFiles]);

  const handleMultipleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || isViewer) return;

    const fileList = Array.from(files);
    setFileUploading(true);
    setUploadProgress({ current: 0, total: fileList.length });

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.uploadFile(formData);

        await api.projects.addFile(projectId, {
          name: res.name || file.name,
          url: res.url,
          size: res.size || file.size,
          type: res.type || file.type,
          folderId: currentFolderId || null,
        });

        setUploadProgress({ current: i + 1, total: fileList.length });
      } catch (err) {
        console.error(`Lỗi tải tệp ${file.name}:`, err);
      }
    }

    await loadProjectFiles(currentFolderId);
    setFileUploading(false);
    setUploadProgress(null);
    e.target.value = '';
  };

  const handleDeleteProjectFile = (fileId: string, fileName: string) => {
    if (isViewer) return;
    showCustomConfirm(`Bạn có chắc muốn xóa tệp "${fileName}" khỏi dự án?`, async () => {
      try {
        await api.projects.deleteFile(projectId, fileId);
        await loadProjectFiles(currentFolderId);
      } catch (err: unknown) {
        showCustomAlert(
          err instanceof Error ? err.message : 'Không thể xóa tệp tin khỏi dự án.'
        );
      }
    });
  };

  const handleAiSmartSearch = async () => {
    if (!aiSearchQuery.trim()) return;
    setAiSearchLoading(true);
    setAiSearchError('');
    try {
      const results = await api.ai.smartSearch(projectId, aiSearchQuery, language);
      setAiSearchResults(results || []);
      setShowAiSearchModal(true);
    } catch (err: unknown) {
      setAiSearchError(
        err instanceof Error ? err.message : 'Lỗi khi kết nối tới trợ lý AI.'
      );
    } finally {
      setAiSearchLoading(false);
    }
  };

  const handleExcelTaskUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelTaskFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const parsedTasks: Array<{
          title: string;
          description: string;
          status: string;
          priority: string;
          projectId: string;
        }> = [];

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const json: Array<Record<string, unknown>> = XLSX.utils.sheet_to_json(worksheet);

          json.forEach((row) => {
            const title =
              row['Tiêu đề'] || row.Title || row['Tên công việc'] || row.title;
            if (title && typeof title === 'string' && title.trim().length > 0) {
              const desc = row['Mô tả'] || row.Description || row.description || '';
              const statusRaw = String(
                row['Trạng thái'] || row.Status || row.status || 'TODO'
              ).toUpperCase();
              const priorityRaw = String(
                row['Mức độ ưu tiên'] || row.Priority || row.priority || 'MEDIUM'
              ).toUpperCase();

              let status = 'TODO';
              if (
                statusRaw.includes('PROGRESS') ||
                statusRaw.includes('TIẾN HÀNH') ||
                statusRaw.includes('ĐANG')
              ) {
                status = 'IN_PROGRESS';
              } else if (
                statusRaw.includes('DONE') ||
                statusRaw.includes('HOÀN THÀNH') ||
                statusRaw.includes('XONG')
              ) {
                status = 'DONE';
              }

              let priority = 'MEDIUM';
              if (priorityRaw.includes('HIGH') || priorityRaw.includes('CAO')) priority = 'HIGH';
              else if (priorityRaw.includes('URGENT') || priorityRaw.includes('KHẨN'))
                priority = 'URGENT';
              else if (priorityRaw.includes('LOW') || priorityRaw.includes('THẤP'))
                priority = 'LOW';

              parsedTasks.push({
                title: title.trim(),
                description: desc ? String(desc).trim() : '',
                status,
                priority,
                projectId,
              });
            }
          });
        });

        if (parsedTasks.length === 0) {
          setExcelTaskError('Không tìm thấy danh sách công việc hợp lệ nào trong file Excel.');
        } else {
          setExcelTasks(parsedTasks);
          setExcelTaskError('');
        }
      } catch (err: unknown) {
        setExcelTaskError(
          'Lỗi khi đọc file Excel: ' + (err instanceof Error ? err.message : '')
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleClearExcelTaskFile = () => {
    setExcelTaskFileName('');
    setExcelTasks([]);
    setExcelTaskError('');
    if (excelTaskFileInputRef.current) {
      excelTaskFileInputRef.current.value = '';
    }
  };

  const handleImportExcelTasks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (excelTasks.length === 0) {
      setExcelTaskError('Vui lòng chọn file Excel chứa danh sách công việc.');
      return;
    }

    setExcelTaskLoading(true);
    setExcelTaskError('');

    try {
      await api.tasks.createBatch({
        projectId,
        tasks: excelTasks,
      });

      setShowExcelTaskModal(false);
      setExcelTasks([]);
      requestProjectDetails();
      loadTasks();
      showCustomAlert(
        `Đã thêm thành công ${excelTasks.length} công việc từ file Excel vào bảng Kanban!`
      );
    } catch (err: unknown) {
      setExcelTaskError(
        err instanceof Error ? err.message : 'Lỗi khi nhập danh sách công việc từ Excel.'
      );
    } finally {
      setExcelTaskLoading(false);
    }
  };

  const downloadSampleTaskTemplate = () => {
    const sampleData = [
      {
        'Tiêu đề': 'Thiết kế giao diện người dùng v2',
        'Mô tả': 'Vẽ mockup Figma cho trang Dashboard và trang cài đặt',
        'Trạng thái': 'TODO',
        'Mức độ ưu tiên': 'HIGH',
      },
      {
        'Tiêu đề': 'Xây dựng API xác thực hai yếu tố (2FA)',
        'Mô tả': 'Viết endpoint gửi OTP về mail và xác thực mã',
        'Trạng thái': 'IN_PROGRESS',
        'Mức độ ưu tiên': 'URGENT',
      },
      {
        'Tiêu đề': 'Viết tài liệu hướng dẫn sử dụng',
        'Mô tả': 'Lập file markdown hướng dẫn deploy hệ thống lên Docker',
        'Trạng thái': 'DONE',
        'Mức độ ưu tiên': 'LOW',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'CongViecMau');
    XLSX.writeFile(workbook, 'Mau_File_Cong_Viec_Homix.xlsx');
  };

  // Xử lý thông điệp gửi về từ WebSocket
  const handleSocketMessage = (msg: Record<string, unknown>) => {
    const action = msg.action as string;
    const payload = msg.payload as Record<string, unknown> | undefined;
    const taskId = msg.taskId as string | undefined;
    setIsReportStale(true);

    if (action === 'REINDEX_POSITIONS' || action === 'AI_SUBTASKS_COMPLETED') {
      loadTasks();
      if (selectedTask && taskId && selectedTask.id === taskId) {
        loadTaskDetails(taskId);
      }
      return;
    }

    if (action === 'ADD_MEMBER' && payload) {
      const mem = payload as unknown as Member;
      setMembers((prev) => {
        if (prev.some((m) => m.userId === mem.userId)) return prev;
        return [...prev, mem];
      });
      return;
    }

    if (action === 'REMOVE_MEMBER' && payload) {
      const mem = payload as unknown as Member;
      setMembers((prev) => prev.filter((m) => m.userId !== mem.userId));
      return;
    }

    if (action === 'UPDATE_MEMBER' && payload) {
      const mem = payload as unknown as Member;
      setMembers((prev) =>
        prev.map((m) => (m.userId === mem.userId ? { ...m, role: mem.role } : m))
      );
      return;
    }

    setTasks((prevTasks) => {
      switch (action) {
        case 'CREATE': {
          const newTask = payload as unknown as Task;
          if (!newTask || prevTasks.some((t) => t.id === newTask.id)) return prevTasks;
          return [...prevTasks, newTask];
        }

        case 'UPDATE':
        case 'MOVE': {
          const updatedTask = payload as unknown as Task;
          if (!updatedTask) return prevTasks;
          return prevTasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
        }

        case 'DELETE':
          return prevTasks.filter((t) => t.id !== taskId);

        default:
          return prevTasks;
      }
    });

    if (selectedTask && selectedTask.id === taskId) {
      if (
        (action === 'ADD_COMMENT' || action === 'UPDATE_COMMENT' || action === 'LIKE_COMMENT') &&
        payload
      ) {
        const commentObj = payload as unknown as Comment;
        setComments((prev) => {
          const idx = prev.findIndex((c) => c.id === commentObj.id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = commentObj;
            return next;
          }
          return [...prev, commentObj];
        });
      } else if (action === 'DELETE_COMMENT' && payload) {
        const commentObj = payload as unknown as Comment;
        setComments((prev) =>
          prev.filter((c) => c.id !== commentObj.id && c.parentCommentId !== commentObj.id)
        );
      } else if (action === 'CREATE' && payload && payload.parentTaskId === taskId) {
        const subObj = payload as unknown as Task;
        setSubtasks((prev) => {
          if (prev.some((s) => s.id === subObj.id)) return prev;
          return [...prev, subObj];
        });
      } else if (action === 'UPDATE' && payload && payload.id === selectedTask.id) {
        setSelectedTask(payload as unknown as Task);
      } else if (action === 'DELETE') {
        if (taskId === selectedTask.id) {
          setSelectedTask(null);
        } else {
          setSubtasks((prev) => prev.filter((s) => s.id !== taskId));
        }
      }
    }
  };

  useProjectSocket({
    projectId,
    userId: currentUserId,
    onProjectMessage: handleSocketMessage,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    requestProjectDetails();
    loadTasks();
    loadProjectFiles();
  }, [projectId, router, requestProjectDetails, loadTasks, loadProjectFiles]);

  const loadTaskFiles = async (taskId: string) => {
    try {
      const files = await api.tasks.getFiles(taskId);
      setTaskFiles(files || []);
    } catch (e) {
      console.error('Lỗi khi tải file task từ backend:', e);
    }
  };

  useEffect(() => {
    if (selectedTask) {
      setEditTitle(selectedTask.title);
      setEditDesc(selectedTask.description || '');
      setEditPriority(selectedTask.priority);
      setEditAssigneeId(selectedTask.assigneeId);

      const searchCommentId = searchParams.get('commentId') || highlightCommentId;
      if (searchCommentId) {
        setDrawerTab('comments');
      } else {
        setDrawerTab('detail');
      }

      if (selectedTask.dueDate) {
        try {
          const date = new Date(selectedTask.dueDate);
          const isoStr = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
          setEditDueDate(isoStr.slice(0, 16));
        } catch {
          setEditDueDate(null);
        }
      } else {
        setEditDueDate(null);
      }

      loadTaskFiles(selectedTask.id);
      loadTaskDetails(selectedTask.id);
    }
  }, [selectedTask, searchParams, highlightCommentId, loadTaskDetails]);

  const handleUploadTaskFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedTask || isViewer) return;

    setTaskFileUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.uploadFile(formData);

        await api.tasks.addFile(selectedTask.id, {
          name: res.name || file.name,
          url: res.url,
          size: res.size || file.size,
          type: res.type || file.type,
        });
      } catch (err) {
        console.error('Lỗi tải file cho task:', err);
      }
    }

    await loadTaskFiles(selectedTask.id);
    setTaskFileUploading(false);
    e.target.value = '';
  };

  const handleDeleteTaskFile = async (fileId: string) => {
    if (!selectedTask || isViewer) return;
    try {
      await api.tasks.deleteFile(selectedTask.id, fileId);
      await loadTaskFiles(selectedTask.id);
    } catch (err: unknown) {
      showCustomAlert(
        err instanceof Error ? err.message : 'Không thể xóa tệp tin công việc.'
      );
    }
  };

  useEffect(() => {
    if (projectId) {
      api.projects
        .getMembers(projectId)
        .then((data) => {
          setMembers(data || []);
        })
        .catch(console.error);
    }
  }, [projectId]);

  useEffect(() => {
    if (!selectedTask || drawerTab !== 'comments') {
      return;
    }

    const taskId = selectedTask.id;
    api.comments.setViewing(taskId, true).catch(console.error);

    const interval = setInterval(() => {
      api.comments.setViewing(taskId, true).catch(console.error);
    }, 10000);

    return () => {
      clearInterval(interval);
      api.comments.setViewing(taskId, false).catch(console.error);
    };
  }, [selectedTask, drawerTab]);

  useEffect(() => {
    const searchTaskId = searchParams.get('taskId');
    const searchCommentId = searchParams.get('commentId');

    if (tasks.length > 0 && searchTaskId) {
      const task = tasks.find((t) => t.id === searchTaskId);
      if (task) {
        setSelectedTask(task);
        loadTaskDetails(task.id);

        if (searchCommentId) {
          setHighlightCommentId(searchCommentId);
          setDrawerTab('comments');
        } else {
          setDrawerTab('detail');
        }

        const url = new URL(window.location.href);
        url.searchParams.delete('taskId');
        url.searchParams.delete('commentId');
        window.history.replaceState({}, '', url.pathname + url.search);
      }
    }
  }, [tasks, searchParams, loadTaskDetails]);

  useEffect(() => {
    if (drawerTab === 'comments' && highlightCommentId && comments.length > 0) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`comment-${highlightCommentId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-primary/20', 'ring-2', 'ring-primary/40');
          setHighlightCommentId(null);

          setTimeout(() => {
            element.classList.remove('bg-primary/20', 'ring-2', 'ring-primary/40');
          }, 3500);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [drawerTab, comments, highlightCommentId]);

  const handleInviteToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjectInviteError('');
    setProjectInviteMessage('');
    setProjectInviteLoading(true);

    try {
      await api.notifications.invite({
        email: projectInviteEmail,
        targetType: 'PROJECT',
        targetId: projectId,
        role: projectInviteRole,
      });
      setProjectInviteMessage(
        language === 'vi'
          ? 'Đã gửi lời mời tham gia dự án thành công!'
          : 'Project invitation sent successfully!'
      );
      setProjectInviteEmail('');
    } catch (err: unknown) {
      setProjectInviteError(
        err instanceof Error ? err.message : 'Lỗi khi gửi lời mời.'
      );
    } finally {
      setProjectInviteLoading(false);
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter((t) => t.status === status && !t.parentTaskId)
      .sort((a, b) => a.position - b.position);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;
    setTaskError('');
    setTaskLoading(true);

    try {
      await api.tasks.create({
        title: newTaskTitle,
        description: newTaskDesc,
        status: modalStatus,
        priority: newTaskPriority,
        projectId,
      });
      setShowTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
    } catch (err: unknown) {
      setTaskError(err instanceof Error ? err.message : 'Lỗi khi tạo công việc.');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleUpdateTaskDetails = async (
    overrides: {
      title?: string;
      description?: string;
      priority?: string;
      assigneeId?: string | null;
      dueDate?: string | null;
    } = {}
  ) => {
    if (!selectedTask || !canEditTask) return;
    try {
      const updated = await api.tasks.update({
        ...selectedTask,
        title: overrides.title !== undefined ? overrides.title : editTitle,
        description: overrides.description !== undefined ? overrides.description : editDesc,
        priority: overrides.priority !== undefined ? overrides.priority : editPriority,
        assigneeId:
          overrides.assigneeId !== undefined ? overrides.assigneeId : editAssigneeId || null,
        dueDate:
          overrides.dueDate !== undefined
            ? overrides.dueDate
            : editDueDate
            ? new Date(editDueDate).toISOString()
            : null,
      });
      setSelectedTask(updated);
    } catch (err: unknown) {
      showCustomAlert(err instanceof Error ? err.message : 'Cập nhật thất bại.');
    }
  };

  const handleDeleteTask = (taskId: string) => {
    if (!canDeleteTask) return;
    showCustomConfirm('Bạn có chắc chắn muốn xóa công việc này?', async () => {
      try {
        await api.tasks.delete(taskId);
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(null);
        }
      } catch (err: unknown) {
        showCustomAlert(err instanceof Error ? err.message : 'Lỗi khi xóa công việc.');
      }
    });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!canEditTask) return;
    showCustomConfirm('Bạn có chắc chắn muốn xóa công việc con này?', async () => {
      try {
        await api.tasks.delete(subtaskId);
        setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));
        if (selectedTask) {
          api.tasks.getLogs(selectedTask.id).then((data) => setTaskLogs(data || []));
        }
      } catch (err: unknown) {
        showCustomAlert(err instanceof Error ? err.message : 'Lỗi khi xóa công việc con.');
      }
    });
  };

  const handleAddComment = async (
    e: React.FormEvent,
    targetComment: Comment | null = null
  ) => {
    e.preventDefault();
    if (!checkPermission('TASK_COMMENT_CREATE')) return;
    const content = targetComment ? replyContent : newCommentContent;
    if (!selectedTask || !content.trim()) return;

    try {
      const parentId = targetComment
        ? targetComment.parentCommentId || targetComment.id
        : null;
      const replyToUserId = targetComment ? targetComment.userId : null;

      const created = await api.comments.create({
        content: content.trim(),
        taskId: selectedTask.id,
        parentCommentId: parentId,
        replyToUserId: replyToUserId,
      });
      if (targetComment) {
        setReplyContent('');
        setReplyParentId(null);
      } else {
        setNewCommentContent('');
      }
      setComments((prev) => {
        if (prev.some((c) => c.id === created.id)) return prev;
        return [...prev, created];
      });
      if (selectedTask) {
        loadTaskDetails(selectedTask.id);
      }
    } catch (err: unknown) {
      showCustomAlert(err instanceof Error ? err.message : 'Lỗi khi gửi bình luận.');
    }
  };

  const handleSaveEditComment = async (commentId: string) => {
    if (!checkPermission('TASK_COMMENT_CREATE') || !editCommentContent.trim()) return;
    try {
      const updated = await api.comments.update(commentId, editCommentContent.trim());
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      setEditingCommentId(null);
    } catch (err: unknown) {
      showCustomAlert(err instanceof Error ? err.message : 'Lỗi khi cập nhật bình luận.');
    }
  };

  const fetchCommentAccessibleDocs = useCallback(async () => {
    if (!workspaceId) return;
    setCommentIsLoadingDocs(true);
    try {
      const docs = await api.workspaces.getAllAccessibleDocuments(workspaceId);
      setCommentAccessibleDocs(docs || []);
    } catch (err) {
      console.error('Failed to fetch accessible documents for comment:', err);
    } finally {
      setCommentIsLoadingDocs(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (commentShowFileSelectorModal) {
      fetchCommentAccessibleDocs();
    }
  }, [commentShowFileSelectorModal, fetchCommentAccessibleDocs]);

  const handleSelectDocToComment = async (doc: {
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
    source?: string;
  }) => {
    if (!selectedTask) return;
    const isImg = doc.type && doc.type.startsWith('image/');
    const payload = {
      text: '',
      attachmentType: isImg ? 'image' : 'file',
      fileName: doc.name,
      fileUrl: doc.url,
      fileSize: doc.size,
      fileType: doc.type,
    };
    try {
      const created = await api.comments.create({
        content: JSON.stringify(payload),
        taskId: selectedTask.id,
        parentCommentId: null,
        replyToUserId: null,
      });
      setComments((prev) => {
        if (prev.some((c) => c.id === created.id)) return prev;
        return [...prev, created];
      });
      loadTaskDetails(selectedTask.id);
      setCommentShowFileSelectorModal(false);
      setCommentShowAttachMenu(false);
    } catch (err: unknown) {
      showCustomAlert(
        err instanceof Error ? err.message : 'Lỗi khi gửi đính kèm bình luận.'
      );
    }
  };

  const handleDirectUploadComment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;
    setCommentIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.uploadFile(formData);

      const isImg = file.type && file.type.startsWith('image/');
      const payload = {
        text: '',
        attachmentType: isImg ? 'image' : 'file',
        fileName: file.name,
        fileUrl: uploadRes.url,
        size: file.size,
        fileSize: file.size,
        fileType: file.type || 'application/octet-stream',
      };
      const created = await api.comments.create({
        content: JSON.stringify(payload),
        taskId: selectedTask.id,
        parentCommentId: null,
        replyToUserId: null,
      });
      setComments((prev) => {
        if (prev.some((c) => c.id === created.id)) return prev;
        return [...prev, created];
      });
      loadTaskDetails(selectedTask.id);
    } catch (err: unknown) {
      showCustomAlert(
        err instanceof Error ? err.message : 'Lỗi khi tải tệp lên thảo luận.'
      );
    } finally {
      setCommentIsUploadingFile(false);
      e.target.value = '';
      setCommentShowAttachMenu(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (!checkPermission('TASK_COMMENT_DELETE')) return;
    showCustomConfirm('Bạn có chắc chắn muốn xóa bình luận này?', async () => {
      try {
        await api.comments.delete(commentId);
        setComments((prev) =>
          prev.filter((c) => c.id !== commentId && c.parentCommentId !== commentId)
        );
      } catch (err: unknown) {
        showCustomAlert(err instanceof Error ? err.message : 'Lỗi khi xóa bình luận.');
      }
    });
  };

  const handleToggleLikeComment = async (commentId: string) => {
    if (isViewer) return;
    try {
      const updated = await api.comments.like(commentId);
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
    } catch (err: unknown) {
      showCustomAlert(err instanceof Error ? err.message : 'Lỗi khi tương tác bình luận.');
    }
  };

  const handleViewLikes = async (commentId: string) => {
    try {
      const users = await api.comments.getLikes(commentId);
      setLikesModalConfig({
        isOpen: true,
        commentId,
        users: users || [],
      });
    } catch (err: unknown) {
      showCustomAlert(
        err instanceof Error ? err.message : 'Lỗi khi lấy danh sách lượt thích.'
      );
    }
  };

  const handleRequestLeaveProject = () => {
    showCustomConfirm(
      'Bạn có chắc chắn muốn gửi yêu cầu rời khỏi dự án này? Yêu cầu sẽ được gửi tới Admin để phê duyệt.',
      async () => {
        try {
          await api.notifications.requestLeave({
            targetType: 'PROJECT',
            targetId: projectId,
          });
          showCustomAlert(
            'Yêu cầu rời dự án đã được gửi thành công tới Admin. Vui lòng chờ phê duyệt.'
          );
        } catch (err: unknown) {
          showCustomAlert(
            err instanceof Error ? err.message : 'Không thể gửi yêu cầu rời dự án.'
          );
        }
      }
    );
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditTask || !selectedTask || !newSubtaskTitle.trim()) return;

    try {
      await api.tasks.create({
        title: newSubtaskTitle,
        projectId,
        parentTaskId: selectedTask.id,
      });
      setNewSubtaskTitle('');
      loadTaskDetails(selectedTask.id);
    } catch (err: unknown) {
      showCustomAlert(err instanceof Error ? err.message : 'Lỗi khi thêm công việc con.');
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!canEditTask) return;
    try {
      const updated = await api.tasks.toggleDone(subtaskId);
      setSubtasks((prev) => prev.map((s) => (s.id === subtaskId ? updated : s)));
      if (selectedTask) {
        api.tasks.getLogs(selectedTask.id).then((data) => setTaskLogs(data || []));
      }
    } catch (err: unknown) {
      showCustomAlert(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái.');
    }
  };

  const handleGenerateAiSubtasks = async () => {
    if (!selectedTask || !canEditTask) return;
    setAiSubtaskLoading(true);
    try {
      const res = await api.tasks.suggestSubtasks(selectedTask.id);
      const suggestions = (res.suggestions || []).map((title: string) => ({
        title,
        selected: true,
      }));
      if (suggestions.length === 0) {
        showCustomAlert('AI không đưa ra gợi ý nào cho công việc này.');
        return;
      }
      setAiSubtaskSuggestions(suggestions);
      setShowAiSubtaskModal(true);
    } catch (err: unknown) {
      showCustomAlert(err instanceof Error ? err.message : 'AI phân rã việc thất bại.');
    } finally {
      setAiSubtaskLoading(false);
    }
  };

  const handleConfirmAddAiSubtasks = async () => {
    if (!selectedTask) return;
    const selectedTitles = aiSubtaskSuggestions
      .filter((s) => s.selected && s.title.trim())
      .map((s) => s.title.trim());

    if (selectedTitles.length === 0) {
      showCustomAlert('Vui lòng chọn ít nhất 1 subtask để thêm.');
      return;
    }

    setAiSubtaskAdding(true);
    try {
      await api.tasks.batchSubtasks(selectedTask.id, selectedTitles);
      loadTaskDetails(selectedTask.id);
      setShowAiSubtaskModal(false);
    } catch (err: unknown) {
      showCustomAlert(err instanceof Error ? err.message : 'Lỗi khi thêm danh sách subtask.');
    } finally {
      setAiSubtaskAdding(false);
    }
  };

  const handleFetchAiSummary = async () => {
    if (aiSummaryContent && !isReportStale) {
      setShowAiSummaryModal(true);
      return;
    }
    setAiSummaryLoading(true);
    setShowAiSummaryModal(true);
    setAiSummaryContent('');
    try {
      const data = await api.ai.getSummary(projectId, language);
      setAiSummaryContent(
        data.summary || (language === 'vi' ? 'Không có hoạt động.' : 'No data.')
      );
      setIsReportStale(false);
    } catch (err: unknown) {
      setAiSummaryContent(
        'Lỗi: ' + (err instanceof Error ? err.message : 'Không thể lấy báo cáo AI.')
      );
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // --- KÉO THẢ NATIVE HTML5 ---
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    if (!canEditTask) {
      e.preventDefault();
      return;
    }
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canEditTask) return;
    e.preventDefault();
  };

  const handleDropOnColumn = async (e: React.DragEvent, targetStatus: string) => {
    if (!canEditTask) return;
    e.preventDefault();
    const taskId = draggedTaskId || e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const columnTasks = getTasksByStatus(targetStatus);
    const movedTask = tasks.find((t) => t.id === taskId);
    if (!movedTask) return;

    if (
      movedTask.status === targetStatus &&
      columnTasks.length > 0 &&
      columnTasks[columnTasks.length - 1].id === taskId
    ) {
      return;
    }

    const prevPosition =
      columnTasks.length > 0 ? columnTasks[columnTasks.length - 1].position : null;

    try {
      await api.tasks.move(taskId, {
        newStatus: targetStatus,
        prevPosition,
        nextPosition: null,
      });
    } catch (err: unknown) {
      showCustomAlert(err instanceof Error ? err.message : 'Không thể di chuyển công việc.');
    } finally {
      setDraggedTaskId(null);
    }
  };

  const handleDropOnCard = async (
    e: React.DragEvent,
    targetStatus: string,
    targetCardId: string
  ) => {
    if (!canEditTask) return;
    e.preventDefault();
    e.stopPropagation();

    const taskId = draggedTaskId || e.dataTransfer.getData('text/plain');
    if (!taskId || taskId === targetCardId) return;

    const columnTasks = getTasksByStatus(targetStatus);
    const targetIdx = columnTasks.findIndex((t) => t.id === targetCardId);
    if (targetIdx === -1) return;

    const nextPosition = columnTasks[targetIdx].position;
    const prevPosition = targetIdx > 0 ? columnTasks[targetIdx - 1].position : null;

    try {
      await api.tasks.move(taskId, {
        newStatus: targetStatus,
        prevPosition,
        nextPosition,
      });
    } catch (err: unknown) {
      showCustomAlert(err instanceof Error ? err.message : 'Không thể di chuyển công việc.');
    } finally {
      setDraggedTaskId(null);
    }
  };

  const getMemberName = (userId: string | null) => {
    if (!userId) return 'Chưa giao';
    const member = members.find((m) => m.userId === userId);
    return member ? member.fullname : 'Thành viên';
  };

  const columns = [
    {
      id: 'TODO',
      title: language === 'vi' ? 'Cần làm (Todo)' : 'To Do',
      color: 'border-violet-500/40 text-violet-400',
    },
    {
      id: 'IN_PROGRESS',
      title: language === 'vi' ? 'Đang làm (In Progress)' : 'In Progress',
      color: 'border-cyan-500/40 text-cyan-400',
    },
    {
      id: 'DONE',
      title: language === 'vi' ? 'Đã xong (Done)' : 'Done',
      color: 'border-emerald-500/40 text-emerald-400',
    },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground relative font-sans overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full glow-orb-primary blur-[140px] pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-screen relative z-10 overflow-y-auto pb-12">
        <KanbanHeader
          t={t}
          language={language}
          project={project}
          members={members}
          projectTab={projectTab}
          setProjectTab={setProjectTab}
          projectFilesCount={projectFiles.length}
          aiSearchQuery={aiSearchQuery}
          setAiSearchQuery={setAiSearchQuery}
          aiSearchLoading={aiSearchLoading}
          onAiSmartSearch={handleAiSmartSearch}
          onBack={() => router.back()}
          onOpenExcelModal={() => setShowExcelTaskModal(true)}
          onFetchAiSummary={handleFetchAiSummary}
          onRequestLeaveProject={handleRequestLeaveProject}
          onOpenMembersModal={() => setShowProjectMembersModal(true)}
        />

        {projectTab === 'FILES' ? (
          <ProjectFilesManager
            t={t}
            canUpdateProject={canUpdateProject}
            fileUploading={fileUploading}
            uploadProgress={uploadProgress}
            folderPath={folderPath}
            projectFiles={projectFiles}
            projectFolders={projectFolders}
            showCreateFolderDialog={showCreateFolderDialog}
            newFolderName={newFolderName}
            creatingFolder={creatingFolder}
            setShowCreateFolderDialog={setShowCreateFolderDialog}
            setNewFolderName={setNewFolderName}
            onMultipleFileUpload={handleMultipleFileUpload}
            onNavigateBreadcrumb={handleNavigateBreadcrumb}
            onOpenFolder={handleOpenFolder}
            onDeleteFolder={handleDeleteFolder}
            onDeleteProjectFile={handleDeleteProjectFile}
            onCreateFolder={handleCreateFolder}
            onPreviewImage={setPreviewImage}
          />
        ) : (
          <KanbanBoard
            columns={columns}
            tasks={tasks}
            canCreateTask={canCreateTask}
            canEditTask={canEditTask}
            getTasksByStatus={getTasksByStatus}
            getMemberName={getMemberName}
            onOpenCreateModal={(status) => {
              setModalStatus(status);
              setShowTaskModal(true);
            }}
            onSelectTask={setSelectedTask}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDropOnColumn={handleDropOnColumn}
            onDropOnCard={handleDropOnCard}
          />
        )}

        {selectedTask && (
          <TaskDetailDrawer
            selectedTask={selectedTask}
            onClose={() => setSelectedTask(null)}
            language={language}
            currentUserId={currentUserId}
            canDeleteTask={canDeleteTask}
            canEditTask={canEditTask}
            canCreateComment={checkPermission('TASK_COMMENT_CREATE')}
            canDeleteComment={checkPermission('TASK_COMMENT_DELETE')}
            drawerTab={drawerTab}
            setDrawerTab={setDrawerTab}
            subtasks={subtasks}
            taskFiles={taskFiles}
            taskLogs={taskLogs}
            comments={comments}
            members={members}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editDesc={editDesc}
            setEditDesc={setEditDesc}
            editPriority={editPriority}
            setEditPriority={setEditPriority}
            editAssigneeId={editAssigneeId}
            setEditAssigneeId={setEditAssigneeId}
            editDueDate={editDueDate}
            setEditDueDate={setEditDueDate}
            onUpdateTaskDetails={handleUpdateTaskDetails}
            onDeleteTask={handleDeleteTask}
            aiSubtaskLoading={aiSubtaskLoading}
            onGenerateAiSubtasks={handleGenerateAiSubtasks}
            onToggleSubtask={handleToggleSubtask}
            onDeleteSubtask={handleDeleteSubtask}
            newSubtaskTitle={newSubtaskTitle}
            setNewSubtaskTitle={setNewSubtaskTitle}
            onAddSubtask={handleAddSubtask}
            taskFileUploading={taskFileUploading}
            onUploadTaskFile={handleUploadTaskFile}
            onDeleteTaskFile={handleDeleteTaskFile}
            onPreviewImage={setPreviewImage}
            getMemberName={getMemberName}
            editingCommentId={editingCommentId}
            setEditingCommentId={setEditingCommentId}
            editCommentContent={editCommentContent}
            setEditCommentContent={setEditCommentContent}
            onSaveEditComment={handleSaveEditComment}
            onDeleteComment={handleDeleteComment}
            onToggleLikeComment={handleToggleLikeComment}
            onViewLikes={handleViewLikes}
            replyParentId={replyParentId}
            setReplyParentId={setReplyParentId}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            newCommentContent={newCommentContent}
            setNewCommentContent={setNewCommentContent}
            onAddComment={handleAddComment}
            commentShowAttachMenu={commentShowAttachMenu}
            setCommentShowAttachMenu={setCommentShowAttachMenu}
            commentIsUploadingFile={commentIsUploadingFile}
            onDirectUploadComment={handleDirectUploadComment}
            commentShowFileSelectorModal={commentShowFileSelectorModal}
            setCommentShowFileSelectorModal={setCommentShowFileSelectorModal}
            commentSearchQuery={commentSearchQuery}
            setCommentSearchQuery={setCommentSearchQuery}
            commentIsLoadingDocs={commentIsLoadingDocs}
            commentAccessibleDocs={commentAccessibleDocs}
            onSelectDocToComment={handleSelectDocToComment}
          />
        )}

        <CreateTaskModal
          show={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          taskError={taskError}
          taskLoading={taskLoading}
          newTaskTitle={newTaskTitle}
          setNewTaskTitle={setNewTaskTitle}
          newTaskDesc={newTaskDesc}
          setNewTaskDesc={setNewTaskDesc}
          newTaskPriority={newTaskPriority}
          setNewTaskPriority={setNewTaskPriority}
          onSubmit={handleCreateTask}
        />

        <AiReportModal
          show={showAiSummaryModal}
          onClose={() => setShowAiSummaryModal(false)}
          loading={aiSummaryLoading}
          content={aiSummaryContent}
          tasks={tasks}
          members={members}
        />

        <AiSmartSearchModal
          show={showAiSearchModal}
          onClose={() => setShowAiSearchModal(false)}
          aiSearchQuery={aiSearchQuery}
          aiSearchError={aiSearchError}
          aiSearchResults={aiSearchResults}
          tasks={tasks}
          onSelectTask={setSelectedTask}
        />

        <AiSubtaskModal
          show={showAiSubtaskModal}
          onClose={() => setShowAiSubtaskModal(false)}
          aiSubtaskSuggestions={aiSubtaskSuggestions}
          setAiSubtaskSuggestions={setAiSubtaskSuggestions}
          aiSubtaskAdding={aiSubtaskAdding}
          onConfirmAdd={handleConfirmAddAiSubtasks}
        />

        <ExcelImportModal
          show={showExcelTaskModal}
          onClose={() => setShowExcelTaskModal(false)}
          excelTaskError={excelTaskError}
          excelTaskFileName={excelTaskFileName}
          excelTasks={excelTasks}
          excelTaskLoading={excelTaskLoading}
          excelTaskFileInputRef={excelTaskFileInputRef}
          onUpload={handleExcelTaskUpload}
          onClearFile={handleClearExcelTaskFile}
          onDownloadSample={downloadSampleTaskTemplate}
          onSubmit={handleImportExcelTasks}
        />

        <ProjectMembersModal
          show={showProjectMembersModal}
          onClose={() => {
            setShowProjectMembersModal(false);
            setProjectInviteError('');
            setProjectInviteMessage('');
          }}
          language={language}
          members={members}
          canInviteToProject={canInviteToProject}
          projectInviteEmail={projectInviteEmail}
          setProjectInviteEmail={setProjectInviteEmail}
          projectInviteRole={projectInviteRole}
          setProjectInviteRole={setProjectInviteRole}
          projectInviteLoading={projectInviteLoading}
          projectInviteMessage={projectInviteMessage}
          projectInviteError={projectInviteError}
          onInvite={handleInviteToProject}
        />

        <ImageLightboxModal previewImage={previewImage} onClose={() => setPreviewImage(null)} />

        <CustomDialogModal dialogConfig={dialogConfig} />

        <LikesModal
          likesModalConfig={likesModalConfig}
          onClose={() => setLikesModalConfig({ isOpen: false, commentId: '', users: [] })}
        />

        {projectId && project && (
          <ChatWidget
            targetType="PROJECT"
            targetId={projectId}
            targetName={project.name}
            workspaceId={workspaceId || ''}
            isViewer={isViewer}
            positionClass="bottom-6 right-6"
            isOpen={activeChat === 'PROJECT'}
            onToggle={() => setActiveChat(activeChat === 'PROJECT' ? null : 'PROJECT')}
            isExpanded={isChatExpanded}
            onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
          />
        )}

        {workspaceId && workspaceName && (
          <ChatWidget
            targetType="WORKSPACE"
            targetId={workspaceId}
            targetName={workspaceName}
            workspaceId={workspaceId}
            isViewer={currentUserWorkspaceMember?.role === 'VIEWER'}
            positionClass="bottom-6 right-[88px]"
            isOpen={activeChat === 'WORKSPACE'}
            onToggle={() => setActiveChat(activeChat === 'WORKSPACE' ? null : 'WORKSPACE')}
            isExpanded={isChatExpanded}
            onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
          />
        )}
      </div>
    </div>
  );
}
