import axiosInstance from './axiosInstance';

const BASE = '/api/v1/games';

// Session completion result
export type SessionResult = {
  success: boolean;
  game_type: string;
  score: {
    total_score: number;
    max_score: number;
    percentage: number;
    breakdown: {
      questions_answered: number;
      total_questions: number;
    };
  };
  completion_message: string;
  tasks_generated: number;
  time_taken: number;
  time_limit: number;
  results_saved: number;
};

// Old individual result type (deprecated but keeping for backward compatibility)
export type SubmitResult<TAnalysis extends Record<string, number> = Record<string, number>> = {
  result_id: string;
  analysis: TAnalysis;
  tasks_generated: number;
};

// Question types
export type MoodScenario = {
  id: number;
  scenario_en: string;
  scenario_ur: string;
  category: string;
  mood_options: string[];
};

export type ScenarioQuestion = {
  id: number;
  question_en: string;
  question_ur: string;
  category: string;
  options: string[];
};

export type QuizQuestion = {
  id: number;
  question_en: string;
  question_ur: string;
  category: string;
  options: string[];
  difficulty: number;
};

// Response types for batch submission
export type MoodResponse = {
  scenario_id: number;
  selected_mood: string;
  time_taken: number;
};

export type ScenarioResponse = {
  scenario_id: number;
  selected_option: string;
  time_taken: number;
};

export type QuizResponse = {
  question_id: number;
  selected_answer: string;
  time_taken: number;
};

// Fetch questions
export async function getMoodScenarios(ageGroup?: string, limit: number = 5) {
  const params = new URLSearchParams();
  if (ageGroup) params.append('age_group', ageGroup);
  params.append('limit', limit.toString());
  
  const { data } = await axiosInstance.get<{ scenarios: MoodScenario[] }>(`${BASE}/mood/questions?${params}`);
  return data.scenarios;
}

export async function getScenarioQuestions(ageGroup?: string, limit: number = 5) {
  const params = new URLSearchParams();
  if (ageGroup) params.append('age_group', ageGroup);
  params.append('limit', limit.toString());
  
  const { data } = await axiosInstance.get<{ questions: ScenarioQuestion[] }>(`${BASE}/scenario/questions?${params}`);
  return data.questions;
}

export async function getQuizQuestions(ageGroup?: string, difficulty?: number, limit: number = 5) {
  const params = new URLSearchParams();
  if (ageGroup) params.append('age_group', ageGroup);
  if (difficulty) params.append('difficulty', difficulty.toString());
  params.append('limit', limit.toString());
  
  const { data } = await axiosInstance.get<{ questions: QuizQuestion[] }>(`${BASE}/islamic-quiz/questions?${params}`);
  return data.questions;
}

// NEW SESSION-BASED ENDPOINTS (Complete game submission)
export async function completeMoodSession(payload: {
  child_id: number;
  total_time_seconds: number;
  responses: MoodResponse[];
}) {
  const { data } = await axiosInstance.post<SessionResult>(`${BASE}/session/mood/complete`, payload);
  return data;
}

export async function completeScenarioSession(payload: {
  child_id: number;
  total_time_seconds: number;
  responses: ScenarioResponse[];
}) {
  const { data } = await axiosInstance.post<SessionResult>(`${BASE}/session/scenario/complete`, payload);
  return data;
}

export async function completeQuizSession(payload: {
  child_id: number;
  total_time_seconds: number;
  responses: QuizResponse[];
}) {
  const { data } = await axiosInstance.post<SessionResult>(`${BASE}/session/islamic-quiz/complete`, payload);
  return data;
}

export async function completeMemorySession(payload: {
  child_id: number;
  total_flips: number;
  correct_matches: number;
  wrong_matches: number;
  time_taken_seconds: number;
}) {
  const { data } = await axiosInstance.post<SessionResult>(`${BASE}/session/memory/complete`, payload);
  return data;
}

// OLD DEPRECATED ENDPOINTS (kept for backward compatibility)
export async function submitMood(payload: {
  child_id: number;
  scenario_id: number;
  selected_mood: 'Anger' | 'Forgive' | 'Happy' | 'Sad';
}) {
  const { data } = await axiosInstance.post<SubmitResult>(`${BASE}/mood/submit`, payload);
  return data;
}

export async function submitMemory(payload: {
  child_id: number;
  total_flips: number;
  correct_matches: number;
  wrong_matches: number;
  time_taken_seconds: number;
}) {
  const { data } = await axiosInstance.post<SubmitResult>(`${BASE}/memory/submit`, payload);
  return data;
}

export async function submitScenario(payload: {
  child_id: number;
  scenario_id: number;
  selected_option: 'Hit' | 'Forgive' | 'Tell teacher';
}) {
  const { data } = await axiosInstance.post<SubmitResult>(`${BASE}/scenario/submit`, payload);
  return data;
}

export async function submitIslamicQuiz(payload: {
  child_id: number;
  question_id: number;
  selected_answer: string;
}) {
  const { data } = await axiosInstance.post<SubmitResult>(`${BASE}/islamic-quiz/submit`, payload);
  return data;
}

export async function getChildAnalysis(childId: number) {
  const { data } = await axiosInstance.get<{
    dominant_strength: string;
    needs_improvement: string;
    suggested_task: string;
    category_scores: Record<string, number>;
  }>(`${BASE}/${childId}/analysis`);
  return data;
}
