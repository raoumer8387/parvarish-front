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
      // Clear auth data and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('onboarding_completed');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Parent Profile
export const getParentProfile = async () => {
  const { data } = await axiosInstance.get('/api/v1/settings/parent/profile');
  return data;
};

export const updateParentProfile = async (profile) => {
  const { data } = await axiosInstance.put('/api/v1/settings/parent/profile', profile);
  return data;
};

// Children
export const getAllChildren = async () => {
  const { data } = await axiosInstance.get('/api/v1/settings/children');
  return data;
};

export const getChild = async (childId) => {
  const { data } = await axiosInstance.get(`/api/v1/settings/children/${childId}`);
  return data;
};

export const addChild = async (child) => {
  const { data } = await axiosInstance.post('/api/v1/settings/children', child);
  return data;
};

export const updateChild = async (childId, child) => {
  const { data } = await axiosInstance.put(`/api/v1/settings/children/${childId}`, child);
  return data;
};

export const deleteChild = async (childId) => {
  const { data } = await axiosInstance.delete(`/api/v1/settings/children/${childId}`);
  return data;
};
