import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ParentNotification,
  fetchParentNotifications,
  markParentNotificationRead,
} from '../api/lackingApi';
import { getAccessToken } from '../api/auth';
import { useParentNotificationSocket } from '../hooks/useParentNotificationSocket';

const PAGE_STEP = 5;
const PANEL_MAX_WIDTH_PX = 448; /* 28rem */
const PANEL_MARGIN = 8;

interface ParentNotificationBellProps {
  token: string | null;
  enabled: boolean;
}

function formatNotificationTime(isoDate: string) {
  const createdAt = new Date(isoDate);
  if (Number.isNaN(createdAt.getTime())) {
    return '';
  }

  const diffMinutes = Math.floor((Date.now() - createdAt.getTime()) / 60000);
  if (diffMinutes < 1) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return createdAt.toLocaleDateString();
}

function normalizeWsPayload(payload: unknown): ParentNotification | null {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Partial<ParentNotification>;
  if (typeof p.id !== 'string' || typeof p.title !== 'string') return null;
  const read = p.read === undefined ? false : Boolean(p.read);
  return {
    id: p.id,
    type: (typeof p.type === 'string' ? p.type : 'lacking_alert') as ParentNotification['type'],
    title: p.title,
    body: typeof p.body === 'string' ? p.body : '',
    data: p.data && typeof p.data === 'object' && !Array.isArray(p.data) ? (p.data as Record<string, unknown>) : {},
    created_at: typeof p.created_at === 'string' ? p.created_at : new Date().toISOString(),
    read,
  };
}

export function ParentNotificationBell({ token, enabled }: ParentNotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [listLimit, setListLimit] = useState(PAGE_STEP);
  const lastLoadedAtRef = useRef(0);
  const notificationsRef = useRef<ParentNotification[]>([]);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelBox, setPanelBox] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  notificationsRef.current = notifications;

  /** Axios uses localStorage; keep UI in sync when App state lags after login/OAuth. */
  const authToken = token ?? getAccessToken();

  const showBrowserNotification = useCallback((incoming: ParentNotification) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    if (!document.hidden) return;
    try {
      // eslint-disable-next-line no-new
      new Notification(incoming.title, { body: incoming.body, tag: incoming.id });
    } catch {
      // ignore unsupported environments
    }
  }, []);

  const loadNotifications = useCallback(
    async (force = false) => {
      if (!authToken || !enabled) {
        setNotifications([]);
        setUnreadCount(0);
        setTotalCount(0);
        return;
      }

      const now = Date.now();
      if (!force && now - lastLoadedAtRef.current < 15_000) {
        return;
      }

      setLoading(true);
      try {
        const data = await fetchParentNotifications(false, listLimit);
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unread_count ?? 0);
        setTotalCount(data.total_count ?? 0);
        lastLoadedAtRef.current = now;
      } catch (error) {
        console.error('Failed to load parent notifications:', error);
      } finally {
        setLoading(false);
      }
    },
    [authToken, enabled, listLimit]
  );

  useEffect(() => {
    if (!authToken || !enabled) {
      setNotifications([]);
      setUnreadCount(0);
      setTotalCount(0);
      setListLimit(PAGE_STEP);
      setOpen(false);
      return;
    }
    setListLimit(PAGE_STEP);
  }, [authToken, enabled]);

  useEffect(() => {
    void loadNotifications(true);
  }, [loadNotifications]);

  useEffect(() => {
    if (open) {
      void loadNotifications(true);
    }
  }, [open, loadNotifications]);

  const handleWsPayload = useCallback(
    (payload: unknown) => {
      const incoming = normalizeWsPayload(payload);
      if (!incoming) return;

      const prevSnapshot = notificationsRef.current;
      const isNew = !prevSnapshot.some((n) => n.id === incoming.id);

      setNotifications((previous) => {
        const idx = previous.findIndex((n) => n.id === incoming.id);
        if (idx >= 0) {
          const next = [...previous];
          const merged = { ...next[idx], ...incoming };
          if (incoming.read === false && next[idx].read) {
            merged.read = next[idx].read;
          }
          next[idx] = merged;
          return next.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        return [incoming, ...previous].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      if (isNew) {
        setTotalCount((t) => t + 1);
        if (!incoming.read) {
          setUnreadCount((u) => u + 1);
          showBrowserNotification(incoming);
        }
      }
    },
    [showBrowserNotification]
  );

  useParentNotificationSocket({
    token: authToken,
    enabled: Boolean(enabled && authToken),
    onMessage: handleWsPayload,
  });

  useEffect(() => {
    const refresh = () => {
      void loadNotifications(true);
    };
    window.addEventListener('focus', refresh);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [loadNotifications]);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!open || !trigger) {
      setPanelBox(null);
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(PANEL_MAX_WIDTH_PX, vw - PANEL_MARGIN * 2, vw * 0.92);
    let left = rect.right - width;
    left = Math.max(PANEL_MARGIN, Math.min(left, vw - width - PANEL_MARGIN));
    const gap = 8;
    let top = rect.bottom + gap;
    const desiredMax = Math.min(32 * 16, vh * 0.72);
    let spaceBelow = vh - top - PANEL_MARGIN;
    let maxHeight = Math.min(desiredMax, spaceBelow);
    const spaceAbove = rect.top - PANEL_MARGIN;
    if (maxHeight < 160 && spaceAbove > spaceBelow + 40) {
      maxHeight = Math.min(desiredMax, spaceAbove - gap);
      top = Math.max(PANEL_MARGIN, rect.top - maxHeight - gap);
    }
    maxHeight = Math.max(140, Math.min(maxHeight, vh - top - PANEL_MARGIN));
    setPanelBox({ top, left, width, maxHeight });
  }, [open]);

  useLayoutEffect(() => {
    updatePanelPosition();
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    updatePanelPosition();
    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);
    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [open, updatePanelPosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const handleMarkRead = async (notificationId: string) => {
    const wasUnread = notifications.some((n) => n.id === notificationId && !n.read);
    try {
      await markParentNotificationRead(notificationId);
      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
      if (wasUnread) {
        setUnreadCount((previous) => Math.max(0, previous - 1));
      }
    } catch (error) {
      console.error('Failed to mark parent notification as read:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      await Notification.requestPermission();
    } catch (e) {
      console.error('Notification permission request failed:', e);
    }
  };

  const permissionLabel =
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied';

  const badgeCount = unreadCount;
  const badgeLabel = badgeCount > 99 ? '99+' : String(badgeCount);
  const canLoadMore = totalCount > notifications.length && listLimit < 500;
  const remainingApprox = Math.max(0, totalCount - notifications.length);

  const panel =
    open &&
    panelBox &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Notifications"
        className="fixed z-[200] flex flex-col overflow-hidden rounded-lg border border-[#A8E6CF]/60 bg-popover text-popover-foreground shadow-lg"
        style={{
          top: panelBox.top,
          left: panelBox.left,
          width: panelBox.width,
          maxHeight: panelBox.maxHeight,
        }}
      >
        <div className="shrink-0 border-b px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#2D5F3F]">Notifications</h3>
              <p className="text-xs text-muted-foreground">All parent updates in one place</p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {unreadCount} unread / {totalCount} total
            </Badge>
          </div>
          {'Notification' in window && permissionLabel !== 'granted' && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="text-xs text-muted-foreground">
                Get alerts when this tab is in the background (browser must stay open).
              </p>
              <Button type="button" size="sm" variant="secondary" onClick={() => void requestNotificationPermission()}>
                Enable browser alerts
              </Button>
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No notifications yet.</div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void handleMarkRead(notification.id)}
                  className={`w-full px-4 py-3 text-left transition hover:bg-muted/50 ${
                    notification.read ? 'opacity-70' : 'bg-[#FFF8E1]/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-[#A8E6CF]/40 p-2 text-[#2D5F3F]">
                      <CheckCheck className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[#2D5F3F]">{notification.title}</p>
                        {!notification.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-muted px-2 py-0.5 uppercase tracking-wide">
                          {String(notification.type).replace(/_/g, ' ')}
                        </span>
                        <span>{formatNotificationTime(notification.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {canLoadMore && (
          <div className="shrink-0 border-t p-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-[#2D5F3F]"
              disabled={loading}
              onClick={() => setListLimit((n) => Math.min(n + PAGE_STEP, 500))}
            >
              {loading ? 'Loading…' : `See more${remainingApprox > 0 ? ` (${remainingApprox} more)` : ''}`}
            </Button>
          </div>
        )}
      </div>,
      document.body
    );

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        className="relative h-11 w-11 shrink-0 overflow-visible rounded-full border-[#A8E6CF] text-[#2D5F3F]"
        aria-label="Open notifications"
        aria-expanded={open}
        aria-haspopup="dialog"
        disabled={!enabled || !authToken}
        onClick={() => setOpen((previous) => !previous)}
      >
        <Bell className="h-5 w-5" />
        {badgeCount > 0 && (
          <Badge className="pointer-events-none absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-orange-500 px-1 text-[10px] text-white hover:bg-orange-500">
            {badgeLabel}
          </Badge>
        )}
      </Button>
      {panel}
    </>
  );
}
