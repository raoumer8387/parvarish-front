import { API_BASE_URL } from './config';

const WS_PATH = '/api/v1/ws/parent-notifications';

/** Build WebSocket URL for parent live notifications (token must be URL-encoded). */
export function getParentNotificationsWebSocketUrl(accessToken: string): string {
  const token = encodeURIComponent(accessToken);

  // Dev: same-origin so Vite proxies WS to the backend (see vite.config.ts).
  if (import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL) {
    const wsProto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${wsProto}://${window.location.host}${WS_PATH}?token=${token}`;
  }

  const trimmed = API_BASE_URL.replace(/\/$/, '');
  const isHttps = /^https:/i.test(trimmed);
  const wsProto = isHttps ? 'wss' : 'ws';
  const hostAndPath = trimmed.replace(/^https?:\/\//i, '');
  return `${wsProto}://${hostAndPath}${WS_PATH}?token=${token}`;
}
