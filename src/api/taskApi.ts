import axiosInstance from './axiosInstance';

interface TaskGenerationPayload {
  child_id: number;
  chatbot_response: string;
  chatbot_tags?: string[];
}

interface Task {
  id: number;
  child_id: number;
  child_name: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed' | 'incomplete';
  category?: string;
  difficulty?: number;
  xp_reward?: number;
  created_at?: string;
  completed_at?: string;
}

interface TasksResponse {
  child_id?: number;
  child_name?: string;
  total: number;
  tasks: Task[];
}

interface AllTasksParams {
  child_id?: number;
  status?: 'pending' | 'completed' | 'incomplete';
}

export const generateChildTasks = async (payload: TaskGenerationPayload) => {
  const response = await axiosInstance.post('/api/v1/tasks/from-chat', payload);
  return response.data;
};

export const getTasksForChild = async (childId: number, status: 'pending' | 'completed' | 'incomplete' = 'pending') => {
  const response = await axiosInstance.get(`/api/v1/tasks/child/${childId}?status=${status}&limit=50`);
  return response.data;
};

/**
 * Get all tasks across all children with optional filters
 */
export const getAllTasks = async (params?: AllTasksParams): Promise<TasksResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.child_id) {
    queryParams.append('child_id', params.child_id.toString());
  }
  
  if (params?.status) {
    queryParams.append('status', params.status);
  }
  
  const queryString = queryParams.toString();
  const url = `/api/v1/tasks/all${queryString ? `?${queryString}` : ''}`;
  
  const response = await axiosInstance.get(url);
  return response.data;
};

export const updateTaskStatus = async (taskId: number, status: 'completed' | 'incomplete' | 'pending') => {
  const response = await axiosInstance.patch(`/api/v1/tasks/${taskId}/status`, { status });
  return response.data;
};

// Convenience methods
export const markTaskAsComplete = async (taskId: number) => {
  return updateTaskStatus(taskId, 'completed');
};

export const markTaskAsIncomplete = async (taskId: number) => {
  return updateTaskStatus(taskId, 'incomplete');
};

export const markTaskAsPending = async (taskId: number) => {
  return updateTaskStatus(taskId, 'pending');
};

export const generateTasksFromScores = async (childId: number, days: number = 3, max_tasks: number = 3) => {
  const response = await axiosInstance.post('/api/v1/tasks/from-scores', {
    child_id: childId,
    days,
    max_tasks,
  });
  return response.data;
};
