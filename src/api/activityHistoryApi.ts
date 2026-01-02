import axiosInstance from './axiosInstance';

export interface GameActivity {
  id: number;
  game_type: string;
  score?: number;
  completed: boolean;
  played_at: string;
  duration_seconds?: number;
}

export interface TaskActivity {
  id: number;
  title: string;
  description?: string;
  category: string;
  status: string;
  xp_reward?: number;
  assigned_at: string;
  completed_at?: string;
}

export interface BehaviorActivity {
  id: number;
  question: string;
  answer: string;
  score: number;
  recorded_at: string;
}

export interface ChatActivity {
  id: number;
  message_count: number;
  first_message?: string;
  started_at: string;
  last_message_at: string;
}

export interface TimelineActivity {
  type: 'game' | 'task' | 'behavior' | 'chat';
  timestamp: string;
  data: any;
}

export interface ActivityStats {
  total_games_played: number;
  games_by_type: Record<string, number>;
  total_tasks: number;
  tasks_completed: number;
  tasks_pending: number;
  tasks_by_category: Record<string, number>;
  total_behavior_responses: number;
  average_behavior_score: number;
  total_chat_messages: number;
  most_active_day: string;
  xp_earned: number;
}

export interface ActivityHistoryResponse {
  child_id: number;
  child_name: string;
  date_from: string;
  date_to: string;
  total_activities: number;
  stats: ActivityStats;
  games: GameActivity[];
  tasks: TaskActivity[];
  behavior_responses: BehaviorActivity[];
  chats: ChatActivity[];
  timeline: TimelineActivity[];
}

/**
 * Fetch full activity history for a child
 * @param childId - ID of the child
 * @param days - Number of days to fetch (default: 30)
 * @returns Full activity history with stats, games, tasks, behaviors, chats, and timeline
 */
export const fetchActivityHistory = async (
  childId: number,
  days: number = 30
): Promise<ActivityHistoryResponse> => {
  const response = await axiosInstance.get(`/api/v1/activity-history/${childId}`, {
    params: { days }
  });
  return response.data;
};

/**
 * Fetch activity summary for a child (lighter, faster)
 * @param childId - ID of the child
 * @param days - Number of days to fetch (default: 30)
 * @returns Just the stats object
 */
export const fetchActivitySummary = async (
  childId: number,
  days: number = 30
): Promise<ActivityStats> => {
  const response = await axiosInstance.get(`/api/v1/activity-history/${childId}/summary`, {
    params: { days }
  });
  return response.data;
};
