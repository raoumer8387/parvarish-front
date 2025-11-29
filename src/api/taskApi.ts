import axiosInstance from './axiosInstance';

interface TaskGenerationPayload {
  child_id: number;
  chatbot_response: string;
  chatbot_tags?: string[];
}

export const generateChildTasks = async (payload: TaskGenerationPayload) => {
  const response = await axiosInstance.post('/api/v1/tasks/from-chat', payload);
  return response.data;
};

export const getTasksForChild = async (childId: number, status: 'pending' | 'completed' = 'pending') => {
  const response = await axiosInstance.get(`/api/v1/tasks/child/${childId}?status=${status}&limit=50`);
  return response.data;
};

export const markTaskAsComplete = async (taskId: number) => {
  const response = await axiosInstance.post(`/api/v1/tasks/${taskId}/complete`);
  return response.data;
};

export const generateTasksFromScores = async (childId: number, days: number = 3, max_tasks: number = 3) => {
  const response = await axiosInstance.post('/api/v1/tasks/from-scores', {
    child_id: childId,
    days,
    max_tasks,
  });
  return response.data;
};
