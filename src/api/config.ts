// API Configuration
// In dev, use same-origin + Vite proxy (vite.config.ts) to avoid CORS / Network Error.
// Set VITE_API_BASE_URL in production (e.g. https://api.yourdomain.com).
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? '' : 'http://localhost:8000');

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    register: `${API_BASE_URL}/api/v1/auth/register`,
    login: `${API_BASE_URL}/api/v1/auth/login`,
    // Google OAuth - backend should redirect back with token in URL params
    // Example: http://localhost:3000?token=YOUR_JWT_TOKEN or http://localhost:3000?access_token=YOUR_JWT_TOKEN
    googleLogin: `${API_BASE_URL}/api/v1/auth/google/login`,
  },
  // Add more endpoints as needed
  parent: {
    profile: `${API_BASE_URL}/api/v1/parent/profile`,
    children: `${API_BASE_URL}/api/v1/parent/children`,
  },
  chat: {
    message: `${API_BASE_URL}/api/v1/chat`,
    history: `${API_BASE_URL}/api/v1/chat/history`,
    voice: `${API_BASE_URL}/api/v1/chat/voice`,
    attachments: `${API_BASE_URL}/api/v1/chat/with-attachments`,
  },
};
