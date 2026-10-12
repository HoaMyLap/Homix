import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000/ws';

export interface StompClientHandle {
  deactivate: () => Promise<void>;
}

interface PendingSub<T = unknown> {
  id: string;
  destination: string;
  callback: (payload: T) => void;
  stompSub?: StompSubscription;
}

class StompConnectionManager {
  private client: Client | null = null;
  private subscriptions = new Map<string, PendingSub<unknown>>();
  private subCounter = 0;

  private ensureClient(): Client {
    if (this.client) {
      return this.client;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(SOCKET_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      beforeConnect: () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          client.connectHeaders = {
            Authorization: `Bearer ${token}`,
          };
        }
      },
    });

    client.onConnect = () => {
      this.subscriptions.forEach((sub) => {
        if (!sub.stompSub) {
          sub.stompSub = this.subscribeInternal(client, sub);
        }
      });
    };

    client.onWebSocketClose = () => {
      this.subscriptions.forEach((sub) => {
        sub.stompSub = undefined;
      });
    };

    client.onStompError = (frame) => {
      console.error('STOMP Broker error:', frame.headers['message'], frame.body);
    };

    client.activate();
    this.client = client;
    return client;
  }

  private subscribeInternal(client: Client, sub: PendingSub<unknown>): StompSubscription {
    return client.subscribe(sub.destination, (message) => {
      if (message.body) {
        try {
          const parsed: unknown = JSON.parse(message.body);
          sub.callback(parsed);
        } catch (e) {
          console.error(`Failed to parse STOMP message on ${sub.destination}:`, e);
        }
      }
    });
  }

  public subscribe<T = unknown>(destination: string, callback: (payload: T) => void): StompClientHandle {
    const client = this.ensureClient();
    const id = `sub_${++this.subCounter}`;
    const entry: PendingSub<unknown> = {
      id,
      destination,
      callback: (payload: unknown) => callback(payload as T),
    };

    if (client.connected) {
      entry.stompSub = this.subscribeInternal(client, entry);
    }

    this.subscriptions.set(id, entry);

    return {
      deactivate: async () => {
        const current = this.subscriptions.get(id);
        if (current?.stompSub) {
          try {
            current.stompSub.unsubscribe();
          } catch {
            // ignore unsubscribe errors on closing socket
          }
        }
        this.subscriptions.delete(id);

        if (this.subscriptions.size === 0 && this.client) {
          const activeClient = this.client;
          this.client = null;
          await activeClient.deactivate();
        }
      },
    };
  }
}

const stompManager = new StompConnectionManager();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createStompClient(projectId: string, onMessageReceived: (message: any) => void): StompClientHandle & Client {
  return stompManager.subscribe(`/topic/projects/${projectId}`, onMessageReceived) as unknown as StompClientHandle & Client;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createNotificationStompClient(userId: string, onNotificationReceived: (notification: any) => void): StompClientHandle & Client {
  return stompManager.subscribe(`/topic/notifications/${userId}`, onNotificationReceived) as unknown as StompClientHandle & Client;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createWorkspaceStompClient(workspaceId: string, onMessageReceived: (message: any) => void): StompClientHandle & Client {
  return stompManager.subscribe(`/topic/workspaces/${workspaceId}`, onMessageReceived) as unknown as StompClientHandle & Client;
}

export function createChatStompClient(
  targetType: string,
  targetId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onMessageReceived: (message: any) => void
): StompClientHandle & Client {
  return stompManager.subscribe(`/topic/chat/${targetType}/${targetId}`, onMessageReceived) as unknown as StompClientHandle & Client;
}
