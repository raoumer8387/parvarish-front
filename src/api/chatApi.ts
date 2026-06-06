import axiosInstance from './axiosInstance';
import { API_BASE_URL } from './config';

const isDev = import.meta.env.DEV;

/** RAG + LLM can be slow on first request (index load). */
const CHAT_TIMEOUT_MS = 120_000;

/** Turn axios/FastAPI errors into a readable chat message. */
export function getChatErrorMessage(err: unknown): string {
  const ax = err as {
    message?: string;
    code?: string;
    response?: { status?: number; data?: { detail?: unknown } };
  };

  if (ax.message === 'Network Error' || ax.code === 'ERR_NETWORK') {
    return 'Cannot reach the server. Ensure the backend is running on port 8000 and restart the Vite dev server.';
  }

  const detail = ax.response?.data?.detail;
  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }
  if (Array.isArray(detail)) {
    const parts = detail
      .map((d) => (typeof d === 'object' && d && 'msg' in d ? String((d as { msg?: string }).msg) : JSON.stringify(d)))
      .filter(Boolean);
    if (parts.length) return parts.join('; ');
  }

  const status = ax.response?.status;
  if (status === 500) {
    return 'Server error (500). Check the backend terminal — often missing or invalid GOOGLE_API_KEY / OPENROUTER_API_KEY in parvarish-be/.env';
  }
  if (status === 401) {
    return 'Session expired. Please log in again.';
  }

  return ax.message || 'Unknown error';
}

export interface ChatRequest {
  message: string;
  child_id?: number | null;
}

export interface ChatResponse {
  response: string;
  user_id: string;
  recommended_videos?: RecommendedVideo[];
}

export interface RecommendedVideo {
  title: string;
  url: string;
}

export interface VoiceChatResponse extends ChatResponse {
  tags?: string[];
  transcription?: string;
  filename?: string;
}

export interface ChatWithAttachmentsResponse extends ChatResponse {
  attachment_names?: string[];
}

function chatUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

/** Images + PDF; max 5 files, 15 MB each (enforced by backend). */
export const sendChatWithAttachments = async (
  files: File[],
  message: string,
  childId?: number | null
): Promise<ChatWithAttachmentsResponse> => {
  const formData = new FormData();
  const trimmed = message.trim();
  if (trimmed) {
    formData.append('message', trimmed);
  }
  for (const file of files) {
    formData.append('files', file);
  }
  if (childId) {
    formData.append('child_id', String(childId));
  }

  if (isDev) {
    console.log('[Chat API] Sending message with attachments', {
      endpoint: chatUrl('/api/v1/chat/with-attachments'),
      fileCount: files.length,
      childId: childId || null,
      hasMessage: !!trimmed,
    });
  }

  const { data } = await axiosInstance.post<ChatWithAttachmentsResponse>(
    '/api/v1/chat/with-attachments',
    formData,
    {
      timeout: CHAT_TIMEOUT_MS,
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return data;
};

export const sendChatMessage = async (
  message: string,
  childId?: number | null
): Promise<ChatResponse> => {
  if (isDev) {
    console.log('[Chat API] Sending text message', {
      endpoint: chatUrl('/api/v1/chat'),
      childId: childId || null,
      messageLength: message.length,
    });
  }

  const { data } = await axiosInstance.post<ChatResponse>(
    '/api/v1/chat',
    {
      message,
      child_id: childId ?? null,
    },
    { timeout: CHAT_TIMEOUT_MS }
  );

  return data;
};

export const sendVoiceMessage = async (
  audioBlob: Blob,
  childId?: number | null
): Promise<VoiceChatResponse> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice.webm');

  if (childId) {
    formData.append('child_id', String(childId));
  }

  if (isDev) {
    console.log('[Chat API] Sending voice message', {
      endpoint: chatUrl('/api/v1/chat/voice'),
      childId: childId || null,
      mimeType: audioBlob.type,
      sizeBytes: audioBlob.size,
    });
  }

  const { data } = await axiosInstance.post<VoiceChatResponse>(
    '/api/v1/chat/voice',
    formData,
    {
      timeout: CHAT_TIMEOUT_MS,
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return data;
};

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  child_id: number | null;
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
}

export const getChatHistory = async (
  childId?: number | null,
  limit: number = 100
): Promise<ChatHistoryResponse> => {
  const params: Record<string, string | number> = { limit };
  if (childId) {
    params.child_id = childId;
  }

  if (isDev) {
    console.log('[Chat API] Fetching chat history', {
      endpoint: chatUrl('/api/v1/chat/history'),
      params,
    });
  }

  const { data } = await axiosInstance.get<ChatHistoryResponse>('/api/v1/chat/history', {
    params,
    timeout: 30_000,
  });

  return data;
};
