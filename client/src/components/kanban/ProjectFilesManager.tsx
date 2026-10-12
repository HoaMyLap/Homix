'use client';

import React from 'react';
import {
  FolderArchive,
  FolderPlus,
  Upload,
  ChevronRight,
  File,
  Folder,
  Trash,
  Eye,
  FileText,
  Download,
  X,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import {
  ProjectFile,
  ProjectFolder,
  isImageFile,
  formatFileSize,
  getFileBadgeStyle,
} from './types';

interface ProjectFilesManagerProps {
  t: ReturnType<typeof useLanguage>['t'];
  canUpdateProject: boolean;
  fileUploading: boolean;
  uploadProgress: { current: number; total: number } | null;
  folderPath: Array<{ id: string; name: string }>;
  projectFiles: ProjectFile[];
  projectFolders: ProjectFolder[];
  showCreateFolderDialog: boolean;
  newFolderName: string;
  creatingFolder: boolean;
  setShowCreateFolderDialog: (val: boolean) => void;
  setNewFolderName: (val: string) => void;
  onMultipleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNavigateBreadcrumb: (folderId: string | null, index: number) => void;
  onOpenFolder: (folderId: string, folderName: string) => void;
  onDeleteFolder: (folderId: string, folderName: string) => void;
  onDeleteProjectFile: (fileId: string, fileName: string) => void;
  onCreateFolder: (e: React.FormEvent) => void;
  onPreviewImage: (img: { url: string; name: string }) => void;
}

export default function ProjectFilesManager({
  t,
  canUpdateProject,
  fileUploading,
  uploadProgress,
  folderPath,
  projectFiles,
  projectFolders,
  showCreateFolderDialog,
  newFolderName,
  creatingFolder,
  setShowCreateFolderDialog,
  setNewFolderName,
  onMultipleFileUpload,
  onNavigateBreadcrumb,
  onOpenFolder,
  onDeleteFolder,
  onDeleteProjectFile,
  onCreateFolder,
  onPreviewImage,
}: ProjectFilesManagerProps) {
  return (
    <main className="max-w-7xl mx-auto px-6 mt-6 relative z-10">
      <div className="glass p-8 rounded-3xl border border-border shadow-xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
          <div>
            <h3 className="text-xl font-bold font-display text-heading flex items-center gap-2">
              <FolderArchive className="h-5 w-5 text-primary" />
              {t('projectDocArchiveTitle')}
            </h3>
            <p className="text-xs text-secondary mt-1">{t('projectDocArchiveSubtitle')}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {canUpdateProject && (
              <button
                onClick={() => setShowCreateFolderDialog(true)}
                className="ui-btn-secondary px-4 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] transition-transform"
              >
                <FolderPlus className="h-4 w-4 text-primary" />
                Tạo thư mục
              </button>
            )}

            {canUpdateProject && (
              <label className="ui-btn-primary px-5 py-2.5 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md hover:scale-[1.02] transition-transform">
                <Upload className="h-4 w-4" />
                {fileUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white/20 border-t-white" />
                    {uploadProgress
                      ? `Uploading: ${uploadProgress.current}/${uploadProgress.total}`
                      : 'Uploading...'}
                  </>
                ) : (
                  t('uploadMultipleFilesBtn')
                )}
                <input
                  type="file"
                  multiple
                  onChange={onMultipleFileUpload}
                  disabled={fileUploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-1.5 text-xs text-secondary font-semibold bg-surface/40 p-3.5 rounded-2xl border border-border/60">
          <span
            onClick={() => onNavigateBreadcrumb(null, -1)}
            className="hover:text-primary cursor-pointer transition-colors flex items-center gap-1"
          >
            <FolderArchive className="h-3.5 w-3.5" /> Gốc (Root)
          </span>
          {folderPath.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <ChevronRight className="h-3 w-3 text-muted shrink-0" />
              <span
                onClick={() => onNavigateBreadcrumb(folder.id, index)}
                className={`hover:text-primary cursor-pointer transition-colors max-w-[150px] truncate ${
                  index === folderPath.length - 1 ? 'text-foreground font-black' : ''
                }`}
              >
                {folder.name}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Quick Upload Drop Area */}
        {canUpdateProject && (
          <label className="block border-2 border-dashed border-border hover:border-primary/50 bg-surface/30 p-6 rounded-2xl text-center cursor-pointer transition-all">
            <Upload className="h-8 w-8 text-primary mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-heading">{t('dragDropMultipleFiles')}</p>
            <p className="text-[10px] text-muted mt-1">{t('supportedFileTypes')}</p>
            <input
              type="file"
              multiple
              onChange={onMultipleFileUpload}
              disabled={fileUploading}
              className="hidden"
            />
          </label>
        )}

        {/* Empty State */}
        {projectFiles.length === 0 && projectFolders.length === 0 ? (
          <div className="p-12 text-center border border-border rounded-2xl">
            <File className="h-10 w-10 text-muted mx-auto mb-3" />
            <h4 className="text-sm font-bold text-heading">Thư mục trống</h4>
            <p className="text-xs text-secondary mt-1">
              Chưa có thư mục hoặc tệp tin nào được tải lên tại đây.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Folders List */}
            {projectFolders.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                  Thư mục ({projectFolders.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projectFolders.map((folder) => (
                    <div
                      key={folder.id}
                      onDoubleClick={() => onOpenFolder(folder.id, folder.name)}
                      className="bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group flex items-center justify-between cursor-pointer"
                    >
                      <div
                        className="flex items-center gap-3 min-w-0 flex-1"
                        onClick={() => onOpenFolder(folder.id, folder.name)}
                      >
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                          <Folder className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-black text-heading truncate" title={folder.name}>
                            {folder.name}
                          </h4>
                          <p className="text-[10px] text-muted mt-0.5">Thư mục tài liệu</p>
                        </div>
                      </div>

                      {canUpdateProject && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFolder(folder.id, folder.name);
                          }}
                          className="p-2 rounded-xl bg-surface border border-border text-muted hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                          title="Xóa thư mục"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files List */}
            {projectFiles.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                  Tệp tin ({projectFiles.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {projectFiles.map((file) => {
                    const isImg = isImageFile(file.type, file.name);
                    const badgeStyle = getFileBadgeStyle(file.name, file.type);

                    return (
                      <div
                        key={file.id}
                        className="bg-surface/80 border border-border hover:border-primary/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
                      >
                        {isImg ? (
                          <div
                            className="relative h-44 w-full bg-black/40 overflow-hidden cursor-pointer flex items-center justify-center border-b border-border/50 group/img"
                            onClick={() => onPreviewImage({ url: file.url, name: file.name })}
                          >
                            { }
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm border border-white/20">
                                <Eye className="h-4 w-4" /> Xem ảnh phóng to
                              </span>
                            </div>
                            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-violet-600/90 text-white text-[10px] font-bold shadow-md">
                              IMAGE
                            </span>
                          </div>
                        ) : (
                          <div className="p-4 border-b border-border/40 bg-card/40 flex items-center gap-3">
                            <div
                              className={`p-3 rounded-2xl border ${badgeStyle.bg} ${badgeStyle.color} shrink-0`}
                            >
                              <FileText className="h-6 w-6" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span
                                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${badgeStyle.bg} ${badgeStyle.color} mb-1`}
                              >
                                {badgeStyle.label}
                              </span>
                              <h4 className="text-xs font-bold text-heading truncate" title={file.name}>
                                {file.name}
                              </h4>
                            </div>
                          </div>
                        )}

                        <div className="p-4 flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            {isImg && (
                              <h4
                                className="text-xs font-bold text-heading truncate mb-0.5"
                                title={file.name}
                              >
                                {file.name}
                              </h4>
                            )}
                            <p className="text-[10px] text-muted">
                              {formatFileSize(file.size)} ·{' '}
                              {new Date(file.uploadedAt).toLocaleDateString('vi-VN')}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {isImg && (
                              <button
                                type="button"
                                onClick={() => onPreviewImage({ url: file.url, name: file.name })}
                                className="p-2 rounded-xl bg-surface border border-border text-secondary hover:text-primary transition-colors"
                                title="Xem ảnh phóng to"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="p-2 rounded-xl bg-surface border border-border text-secondary hover:text-primary transition-colors"
                              title="Tải về tệp tin"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                            {canUpdateProject && (
                              <button
                                type="button"
                                onClick={() => onDeleteProjectFile(file.id, file.name)}
                                className="p-2 rounded-xl bg-surface border border-border text-muted hover:text-rose-400 hover:border-rose-500/30 transition-colors"
                                title="Xóa tệp tin"
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Folder Dialog Overlay */}
      {showCreateFolderDialog && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-heading flex items-center gap-2">
                <FolderPlus className="h-5 w-5 text-primary" />
                Tạo thư mục mới
              </h3>
              <button
                onClick={() => {
                  setShowCreateFolderDialog(false);
                  setNewFolderName('');
                }}
                className="p-1 rounded-full hover:bg-muted text-muted hover:text-foreground transition-all border-0 bg-transparent cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={onCreateFolder} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted block">Tên thư mục</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nhập tên thư mục..."
                  className="ui-input w-full px-4 py-2.5 text-xs bg-[#fdfdfd] dark:bg-[#1a1626] border border-[#cbd3e3] dark:border-[#353043] rounded-xl focus:outline-none text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateFolderDialog(false);
                    setNewFolderName('');
                  }}
                  className="ui-btn-secondary px-4 py-2.5 text-xs font-bold cursor-pointer"
                  disabled={creatingFolder}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="ui-btn-primary px-5 py-2.5 text-xs font-bold cursor-pointer"
                  disabled={creatingFolder}
                >
                  {creatingFolder ? 'Đang tạo...' : 'Tạo thư mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
