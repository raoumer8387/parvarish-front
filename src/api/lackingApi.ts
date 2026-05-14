import axiosInstance from './axiosInstance';

export interface LackingArea {
  area: string;
  label: string;
  score: number;
  priority: 'high' | 'medium';
  game_type: string;
}

export interface LackingAnalysis {
  child_id?: number;
  child_name: string;
  total_games_played: number;
  lacking_areas: LackingArea[];
  requires_attention: boolean;
}

export interface AllChildrenLackingResponse {
  children: LackingAnalysis[];
  total_children: number;
  children_needing_attention: number;
}

export interface Notification {
  id: string;
  child_name: string;
  lacking_label: string;
  score: number;
  priority: 'high' | 'medium';
  message: string;
  read: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

export interface GuidanceResponse {
  child_name: string;
  lacking_label: string;
  score: number;
  guidance: string;
  islamic_references_used: boolean;
}

export interface GeneratedTask {
  title: string;
  description: string;
  category: string;
  difficulty: number;
  xp_reward: number;
  islamic_reference: string;
}

export interface TasksResponse {
  child_id: number;
  child_name: string;
  tasks: GeneratedTask[];
  tasks_saved: boolean;
}

/**
 * Get lacking analysis for a child
 */
export async function fetchLackingAnalysis(
  childId: number,
  days: number = 7
): Promise<LackingAnalysis> {
  const response = await axiosInstance.get(
    `/api/v1/parent/lacking/analyze/${childId}`,
    {
      params: { 
        days,
        // Add timestamp to prevent caching
        _t: new Date().getTime()
      },
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }
  );
  console.log('API Response - Lacking Analysis:', {
    childId,
    status: response.status,
    data: response.data
  });
  return response.data;
}

/**
 * Get lacking analysis for all children
 */
export async function fetchAllChildrenLackingAnalysis(
  days: number = 7
): Promise<AllChildrenLackingResponse> {
  const response = await axiosInstance.get(
    '/api/v1/parent/lacking/analyze/all',
    {
      params: { days }
    }
  );
  return response.data;
}

/**
 * Get notifications for lacking areas
 * @param childId - Optional child ID to filter notifications
 * @param unreadOnly - Only fetch unread notifications
 */
export async function fetchNotifications(
  childId?: number,
  unreadOnly: boolean = false
): Promise<NotificationsResponse> {
  const params: Record<string, any> = {};
  
  if (childId !== undefined) {
    params.child_id = childId;
  }
  if (unreadOnly) {
    params.unread_only = unreadOnly;
  }
  
  const response = await axiosInstance.get(
    '/api/v1/parent/lacking/notifications',
    { params }
  );
  return response.data;
}

/**
 * Get Islamic guidance for a specific lacking area
 */
export async function getGuidance(
  childId: number,
  lackingArea: string
): Promise<GuidanceResponse> {
  const response = await axiosInstance.post(
    '/api/v1/parent/lacking/guidance',
    {
      child_id: childId,
      lacking_area: lackingArea
    }
  );
  return response.data;
}

/**
 * Generate Islamic tasks for a lacking area
 */
export async function generateTasks(
  childId: number,
  lackingArea: string,
  numTasks: number = 3
): Promise<TasksResponse> {
  const response = await axiosInstance.post(
    '/api/v1/parent/lacking/generate-tasks',
    {
      child_id: childId,
      lacking_area: lackingArea,
      num_tasks: numTasks
    }
  );
  return response.data;
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(
  notificationId: string
): Promise<void> {
  await axiosInstance.post(
    '/api/v1/parent/lacking/notifications/mark-read',
    {
      notification_id: notificationId
    }
  );
}

/** Unified parent notification feed (REST + WebSocket same shape, except WS may omit `read`). */
export type ParentNotificationType =
  | 'lacking_alert'
  | 'child_game_completed'
  | 'daily_checkin_reminder'
  | string;

export interface ParentNotification {
  id: string;
  type: ParentNotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  created_at: string;
  read: boolean;
}

export interface ParentNotificationsListResponse {
  notifications: ParentNotification[];
  total_count: number;
  unread_count: number;
}

export async function fetchParentNotifications(
  unreadOnly = false,
  limit = 10
): Promise<ParentNotificationsListResponse> {
  const capped = Math.min(Math.max(limit, 1), 500);
  const response = await axiosInstance.get('/api/v1/parent/notifications', {
    params: { unread_only: unreadOnly, limit: capped },
  });
  return response.data;
}

export async function markParentNotificationRead(notificationId: string): Promise<void> {
  await axiosInstance.post('/api/v1/parent/notifications/mark-read', {
    notification_id: notificationId,
  });
}
