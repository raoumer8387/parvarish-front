import axiosInstance from './axiosInstance';

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
  recent_tasks: unknown[];
}

export interface ProgressInsight {
  type: string;
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

export type CategoryChange = 'upgraded' | 'downgraded' | 'stable' | 'new';

export interface SkillAreaItem {
  area: string;
  label: string;
  score: number;
  priority?: string;
  game_type?: string;
  status?: string;
}

export interface UnifiedBehaviorAnalysis {
  child_id: number;
  period_days: number;
  overall_score: number;
  unified_scores: Record<string, number>;
  category_changes: Record<string, CategoryChange>;
  upgraded_categories: string[];
  downgraded_categories: string[];
  strongest_category: string | null;
  weakest_category: string | null;
  sources: {
    daily_checkin: Record<string, number>;
    games: Record<string, number>;
    tasks: Record<string, number>;
  };
  skill_areas: {
    lacking_areas: SkillAreaItem[];
    all_areas: SkillAreaItem[];
    requires_attention: boolean;
  };
  data_freshness: {
    last_check_in: string | null;
    last_game: string | null;
    last_task: string | null;
  };
  analyzed_at: string;
}

export interface ChildProgressDashboard {
  child_info: ChildInfo;
  period_days: number;
  unified_analysis: UnifiedBehaviorAnalysis;
  behavior_summary: BehaviorSummary;
  games_summary: GamesSummary;
  tasks_summary: TasksSummary;
  progress_insights: ProgressInsights;
  recent_activity: RecentActivity[];
}

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
  overall_behavior_score: number;
  unified_scores: Record<string, number>;
  downgraded_categories: string[];
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

export interface DashboardUpdatePayload {
  type: 'dashboard_update';
  title?: string;
  body?: string;
  data?: {
    child_id?: number;
    child_name?: string;
    trigger?: string;
    unified_analysis?: UnifiedBehaviorAnalysis;
  };
  created_at?: string;
}

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

export const getChildUnifiedAnalysis = async (
  childId: number,
  days: number = 30
): Promise<UnifiedBehaviorAnalysis> => {
  const { data } = await axiosInstance.get(
    `/api/v1/child-progress/${childId}/unified`,
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
