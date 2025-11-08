// API Configuration
// Change this URL when deploying to production
export const API_BASE_URL = 'http://localhost:8000';

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
  chatbot: {
    message: `${API_BASE_URL}/api/v1/chatbot/message`,
  },
};
