import axios from 'axios'
import { API_BASE_URL } from './config'

const api = axios.create({
  baseURL: API_BASE_URL,
})

// Response interceptor to handle 401 errors (session expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_info')
      localStorage.removeItem('onboarding_completed')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

// Step 1: Google login - sends Google user info to backend
export const googleLogin = async (googleUserData) => {
  const { data } = await api.post('/api/v1/auth/google-login', googleUserData)
  return data
}

// Step 2: Register parent profile with user_id from step 1
export const registerParent = async (parentData) => {
  const { data } = await api.post('/api/v1/auth/register-parent', parentData)
  return data
}

// Step 3: Add children with parent_id from step 2
export const addChildren = async (childrenData) => {
  const { data } = await api.post('/api/v1/auth/add-children', childrenData)
  return data
}

export const parentApi = { googleLogin, registerParent, addChildren }
