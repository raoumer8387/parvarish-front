import axios from 'axios';
import { API_BASE_URL } from './config';

// Create axios instance with interceptor for session expiration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors (session expired)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('onboarding_completed');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

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

// Get personalized behavior questions for parent's children
export const getPersonalizedQuestions = async (
  parentId: number,
  totalQuestions: number = 5
): Promise<BehaviorQuestion[]> => {
  const { data } = await axiosInstance.get(
    `/api/v1/behavior/questions/personalized/${parentId}`,
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
