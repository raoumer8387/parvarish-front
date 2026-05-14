import { API_BASE_URL } from './config';

const WS_PATH = '/api/v1/ws/parent-notifications';

/** Build WebSocket URL for parent live notifications (token must be URL-encoded). */
export function getParentNotificationsWebSocketUrl(accessToken: string): string {
  const trimmed = API_BASE_URL.replace(/\/$/, '');
  const isHttps = /^https:/i.test(trimmed);
  const wsProto = isHttps ? 'wss' : 'ws';
  const hostAndPath = trimmed.replace(/^https?:\/\//i, '');
  return `${wsProto}://${hostAndPath}${WS_PATH}?token=${encodeURIComponent(accessToken)}`;
}
