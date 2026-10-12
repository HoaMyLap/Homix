'use client';

import { useEffect, useRef } from 'react';
import {
  createStompClient,
  createChatStompClient,
  createNotificationStompClient,
  StompClientHandle,
} from '@/lib/socket';

interface UseProjectSocketOptions {
  projectId: string;
  userId?: string;
  onProjectMessage?: (msg: Record<string, unknown>) => void;
  onChatMessage?: (msg: Record<string, unknown>) => void;
  onNotification?: (notif: Record<string, unknown>) => void;
}

/**
 * Custom hook quản lý đăng ký đồng thời các kênh STOMP trên cùng một kết nối WebSocket (Multiplexing):
 * - /topic/projects/{projectId}
 * - /topic/chat/project/{projectId}
 * - /topic/notifications/{userId}
 */
export function useProjectSocket({
  projectId,
  userId,
  onProjectMessage,
  onChatMessage,
  onNotification,
}: UseProjectSocketOptions) {
  const onProjectRef = useRef(onProjectMessage);
  const onChatRef = useRef(onChatMessage);
  const onNotifRef = useRef(onNotification);

  useEffect(() => {
    onProjectRef.current = onProjectMessage;
    onChatRef.current = onChatMessage;
    onNotifRef.current = onNotification;
  });

  useEffect(() => {
    const handles: StompClientHandle[] = [];

    if (projectId && onProjectRef.current) {
      handles.push(
        createStompClient(projectId, (msg) => {
          onProjectRef.current?.(msg as Record<string, unknown>);
        })
      );
    }

    if (projectId && onChatRef.current) {
      handles.push(
        createChatStompClient('project', projectId, (msg) => {
          onChatRef.current?.(msg as Record<string, unknown>);
        })
      );
    }

    if (userId && onNotifRef.current) {
      handles.push(
        createNotificationStompClient(userId, (notif) => {
          onNotifRef.current?.(notif as Record<string, unknown>);
        })
      );
    }

    return () => {
      handles.forEach((h) => {
        h.deactivate().catch(() => {});
      });
    };
  }, [projectId, userId]);
}
