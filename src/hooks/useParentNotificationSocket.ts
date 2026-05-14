import { useEffect, useRef } from 'react';
import { getParentNotificationsWebSocketUrl } from '../api/parentNotificationsWs';

type OnMessage = (payload: unknown) => void;

interface UseParentNotificationSocketOptions {
  token: string | null;
  enabled: boolean;
  onMessage: OnMessage;
}

/**
 * Parent notification WebSocket: reconnect with exponential backoff, optional ping.
 */
export function useParentNotificationSocket({
  token,
  enabled,
  onMessage,
}: UseParentNotificationSocketOptions) {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!token || !enabled) {
      return;
    }

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let pingTimer: ReturnType<typeof setInterval> | undefined;
    let attempt = 0;
    let socket: WebSocket | null = null;

    const clearPing = () => {
      if (pingTimer !== undefined) {
        clearInterval(pingTimer);
        pingTimer = undefined;
      }
    };

    const connect = () => {
      if (cancelled) return;

      const url = getParentNotificationsWebSocketUrl(token);
      socket = new WebSocket(url);

      socket.onopen = () => {
        attempt = 0;
        clearPing();
        pingTimer = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send('ping');
          }
        }, 45000);
      };

      socket.onmessage = (event) => {
        const raw = event.data;
        if (typeof raw !== 'string') return;
        if (raw === 'pong' || raw === '"pong"') return;
        try {
          const parsed = JSON.parse(raw) as unknown;
          if (parsed === 'pong') return;
          onMessageRef.current(parsed);
        } catch {
          // ignore non-JSON frames (e.g. plain pong variants)
        }
      };

      socket.onerror = () => {
        socket?.close();
      };

      socket.onclose = () => {
        clearPing();
        socket = null;
        if (cancelled) return;
        attempt += 1;
        const delayMs = Math.min(30_000, 1000 * 2 ** Math.min(attempt, 5));
        reconnectTimer = setTimeout(connect, delayMs);
      };
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer !== undefined) clearTimeout(reconnectTimer);
      clearPing();
      socket?.close();
      socket = null;
    };
  }, [token, enabled]);
}
