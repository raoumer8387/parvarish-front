import axiosInstance from './axiosInstance';
import { API_BASE_URL } from './config';

const isDev = import.meta.env.DEV;

export interface ChatRequest {
  message: string;
  child_id?: number | null;
}

export interface ChatResponse {
  response: string;
  user_id: string;
}

export interface VoiceChatResponse extends ChatResponse {
  tags?: string[];
}

// Send chat message with optional child context
export const sendChatMessage = async (
  message: string,
  childId?: number | null
): Promise<ChatResponse> => {
  if (isDev) {
    console.log('[Chat API] Sending text message', {
      endpoint: '/api/v1/chat',
      childId: childId || null,
      messageLength: message.length,
    });
  }

  const { data } = await axiosInstance.post<ChatResponse>('/api/v1/chat', {
    message,
    child_id: childId || null,
  });

  if (isDev) {
    console.log('[Chat API] Text message response received', {
      hasResponseText: !!data?.response,
      userId: data?.user_id,
    });
  }

  return data;
};

// Send recorded voice message as FormData with optional child context
export const sendVoiceMessage = async (
  audioBlob: Blob,
  childId?: number | null
): Promise<VoiceChatResponse> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice.webm');

  if (childId) {
    formData.append('child_id', String(childId));
  }

  const token = localStorage.getItem('access_token');

  if (isDev) {
    console.log('[Chat API] Sending voice message', {
      endpoint: `${API_BASE_URL}/api/v1/chat/voice`,
      childId: childId || null,
      mimeType: audioBlob.type,
      sizeBytes: audioBlob.size,
      hasAuthToken: !!token,
    });
  }

  const res = await fetch(`${API_BASE_URL}/api/v1/chat/voice`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    if (isDev) {
      console.error('[Chat API] Voice message request failed', {
        status: res.status,
        statusText: res.statusText,
        responseText: errorText,
      });
    }
    throw new Error(errorText || 'Voice chat request failed');
  }

  const data = (await res.json()) as VoiceChatResponse;

  if (isDev) {
    console.log('[Chat API] Voice message response received', {
      hasResponseText: !!data?.response,
      userId: data?.user_id,
      tagsCount: data?.tags?.length || 0,
    });
  }

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

  if (isDev) {
    console.log('[Chat API] Fetching chat history', {
      endpoint: '/api/v1/chat/history',
      params,
    });
  }

  const { data } = await axiosInstance.get<ChatHistoryResponse>('/api/v1/chat/history', {
    params,
  });

  if (isDev) {
    console.log('[Chat API] Chat history response received', {
      messagesCount: data?.messages?.length || 0,
    });
  }

  return data;
};
