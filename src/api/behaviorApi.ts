import axiosInstance from './axiosInstance';

export interface BehaviorQuestion {
  child_id: number;
  child_name: string;
  question_id: number;
  question_text: string;
  options: string[];
  category: string;
}

export interface BehaviorResponse {
  child_id: number;
  question_id: number;
  answer: string;
}

export interface BehaviorHistoryItem {
  id: number;
  question_text: string;
  answer: string;
  score: number;
  timestamp: string;
}

// Parent's children basic info
export interface ChildInfo {
  id: number;
  name: string;
  age?: number;
}

// Check-in status per child
export interface ChildCheckInStatus {
  child_id: number;
  child_name: string;
  needs_check_in: boolean;
}

export interface CheckInStatusResponse {
  children: ChildCheckInStatus[];
}

// Child behavior stats
export interface ChildStats {
  child_id: number;
  behavior_level: number;
  islamic_knowledge: number;
  categories?: Record<string, number>;
}

export const getParentChildren = async (): Promise<ChildInfo[]> => {
  const { data } = await axiosInstance.get('/api/v1/parent/children');
  return data;
};

// Get check-in status for all children
export const getCheckInStatus = async (): Promise<CheckInStatusResponse> => {
  const { data } = await axiosInstance.get('/api/v1/behavior/check-in-status');
  return data;
};

// Get behavior stats for a specific child
export const getChildStats = async (childId: number): Promise<ChildStats> => {
  const { data } = await axiosInstance.get(`/api/v1/behavior/stats/${childId}`);
  return data;
};

// Get personalized behavior questions for parent's children
export const getPersonalizedQuestions = async (
  _parentId: number,
  totalQuestions: number = 5
): Promise<BehaviorQuestion[]> => {
  const { data } = await axiosInstance.get(
    `/api/v1/behavior/questions/personalized`,
    { params: { total_questions: totalQuestions } }
  );
  return data;
};

// One-child-at-a-time: fetch questions for a single child
export const getChildQuestions = async (
  childId: number,
  totalQuestions: number = 5
): Promise<BehaviorQuestion[]> => {
  const { data } = await axiosInstance.get(
    `/api/v1/behavior/questions/${childId}`,
    { params: { total_questions: totalQuestions } }
  );
  return data;
};

// Submit behavior responses
export const submitBehaviorResponses = async (responses: BehaviorResponse[]) => {
  const { data } = await axiosInstance.post('/api/v1/behavior/submit-responses', {
    responses,
  });
  return data;
};

// Submit responses for a single child (new flow)
export interface ChildBehaviorSubmitPayload {
  child_id: number;
  responses: { question_id: number; answer: string }[];
}

export interface ChildBehaviorSubmitResult {
  child_id: number;
  total_score: number;
  total_questions: number;
}

export const submitChildBehaviorResponses = async (
  childId: number,
  responses: { question_id: number; answer: string }[]
): Promise<ChildBehaviorSubmitResult> => {
  const { data } = await axiosInstance.post('/api/v1/behavior/submit-responses', {
    child_id: childId,
    responses,
  });
  return data;
};

// Get behavior history for a specific child
export const getChildBehaviorHistory = async (
  childId: number,
  limit: number = 20
) => {
  const { data } = await axiosInstance.get(
    `/api/v1/behavior/child/${childId}/history`,
    { params: { limit } }
  );
  return data;
};

// Helper function to check if behavior check-in is done today
export const shouldShowBehaviorPopup = (): boolean => {
  const lastCheckIn = localStorage.getItem('lastBehaviorCheckIn');
  
  if (!lastCheckIn) {
    return true; // Never done, show it
  }
  
  const lastDate = new Date(lastCheckIn);
  const now = new Date();
  
  // Check if different day
  if (lastDate.toDateString() !== now.toDateString()) {
    return true; // New day, show it
  }
  
  return false; // Already done today
};

// Save check-in completion timestamp
export const markBehaviorCheckInComplete = () => {
  localStorage.setItem('lastBehaviorCheckIn', new Date().toISOString());
};

// Check if reminder should be shown (2 hours after "Ask Me Later")
export const shouldShowReminder = (): boolean => {
  const reminderTime = localStorage.getItem('behaviorCheckInReminder');
  
  if (!reminderTime) {
    return false;
  }
  
  const reminderDate = new Date(reminderTime);
  const now = new Date();
  
  // Show if 2 hours have passed
  return now.getTime() - reminderDate.getTime() >= 2 * 60 * 60 * 1000;
};

// Set reminder for later
export const setReminder = () => {
  localStorage.setItem('behaviorCheckInReminder', new Date().toISOString());
};

// Clear reminder
export const clearReminder = () => {
  localStorage.removeItem('behaviorCheckInReminder');
};
