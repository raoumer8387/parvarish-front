import axiosInstance from './axiosInstance';

// Child Progress Dashboard Types
export interface ChildInfo {
  id: number;
  name: string;
  age: number;
  gender: string;
  school: string;
  class_name: string;
  temperament: string;
  created_at: string;
}

export interface BehaviorSummary {
  stats: {
    avg_score: number;
    total_responses: number;
    categories: Record<string, number>;
  };
  last_check_in: string;
  hours_since_last_check_in: number;
  needs_check_in: boolean;
  recent_responses_count: number;
  total_responses_period: number;
}

export interface GamePerformance {
  total_sessions: number;
  avg_scores: Record<string, number>;
  recent_scores: number[];
  improvement_trend: 'improving' | 'stable' | 'declining';
}

export interface GamesSummary {
  total_sessions: number;
  games_played: string[];
  performance_by_game: Record<string, GamePerformance>;
  category_averages: Record<string, number>;
  strongest_category: string;
  weakest_category: string;
  last_game_date: string;
}

export interface TasksSummary {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  completion_rate: number;
  categories: Record<string, {
    total: number;
    completed: number;
    completion_rate: number;
  }>;
  recent_tasks: any[];
}

export interface ProgressInsight {
  type: 'improvement' | 'concern' | 'achievement';
  message: string;
  action: string;
}

export interface Recommendation {
  category: string;
  title: string;
  description: string;
}

export interface ProgressInsights {
  overall_engagement_score: number;
  insights: ProgressInsight[];
  recommendations: Recommendation[];
}

export interface RecentActivity {
  type: 'behavior' | 'game' | 'task';
  date: string;
  title: string;
  description: string;
  score?: number;
}

export interface ChildProgressDashboard {
  child_info: ChildInfo;
  period_days: number;
  behavior_summary: BehaviorSummary;
  games_summary: GamesSummary;
  tasks_summary: TasksSummary;
  progress_insights: ProgressInsights;
  recent_activity: RecentActivity[];
}

// Overview Types
export interface ChildOverview {
  id: number;
  name: string;
  age: number;
  recent_activities: {
    behavior_responses: number;
    games_played: number;
    tasks_assigned: number;
    tasks_completed: number;
  };
  engagement_score: number;
  needs_attention: boolean;
  last_activity: string;
}

export interface AllChildrenOverview {
  total_children: number;
  children: ChildOverview[];
  summary: {
    total_activities: number;
    children_needing_attention: number;
    overall_engagement: number;
    period_days: number;
  };
}

// API Functions
export const getChildProgressDashboard = async (
  childId: number,
  days: number = 30
): Promise<ChildProgressDashboard> => {
  const { data } = await axiosInstance.get(
    `/api/v1/child-progress/${childId}/dashboard`,
    { params: { days } }
  );
  return data;
};

export const getAllChildrenOverview = async (
  days: number = 7
): Promise<AllChildrenOverview> => {
  const { data } = await axiosInstance.get(
    '/api/v1/child-progress/overview',
    { params: { days } }
  );
  return data;
};