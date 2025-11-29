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

// New interfaces for chat history
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  child_id: number | null;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
}

// Get chat history, with optional filtering by child
export const getChatHistory = async (
  childId?: number | null,
  limit: number = 100
): Promise<ChatHistoryResponse> => {
  const params: any = { limit };
  if (childId) {
    params.child_id = childId;
  }

  const { data } = await axiosInstance.get<ChatHistoryResponse>('/api/v1/chat/history', {
    params,
  });
  return data;
};
