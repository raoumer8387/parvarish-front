import axiosInstance from './axiosInstance';

export interface ChatRequest {
  message: string;
  child_id?: number | null;
}

export interface ChatResponse {
  response: string;
  user_id: string;
}

// Send chat message with optional child context
export const sendChatMessage = async (
  message: string,
  childId?: number | null
): Promise<ChatResponse> => {
  const { data } = await axiosInstance.post<ChatResponse>('/api/v1/chat', {
    message,
    child_id: childId || null,
  });
  return data;
};
