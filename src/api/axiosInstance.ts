import axios from 'axios';
import { API_BASE_URL } from './config';

const isDev = import.meta.env.DEV;

// Create axios instance
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
    if (isDev) {
      console.log('[API][Request]', {
        method: config.method?.toUpperCase(),
        baseURL: config.baseURL,
        url: config.url,
        params: config.params,
        data: config.data,
        hasAuthToken: !!token,
      });
    }
    return config;
  },
  (error) => {
    if (isDev) {
      console.error('[API][Request Error]', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors (session expired)
axiosInstance.interceptors.response.use(
  (response) => {
    if (isDev) {
      console.log('[API][Response]', {
        status: response.status,
        method: response.config.method?.toUpperCase(),
        url: `${response.config.baseURL || ''}${response.config.url || ''}`,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    if (isDev) {
      console.error('[API][Response Error]', {
        message: error?.message,
        status: error?.response?.status,
        method: error?.config?.method?.toUpperCase(),
        url: `${error?.config?.baseURL || ''}${error?.config?.url || ''}`,
        responseData: error?.response?.data,
      });
    }
    // If 401 Unauthorized (session expired or invalid token)
    if (error.response && error.response.status === 401) {
      // Clear all auth data
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('onboarding_completed');
      
      // Redirect to login page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
