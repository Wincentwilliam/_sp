import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem('token', token);

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear auth and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

// Profile API
export const profileAPI = {
  getProfile: () => api.get('/profile'),
  getHealthProfile: () => api.get('/profile/health'),
  saveHealthProfile: (data) => api.post('/profile/health', data),
};

// AI API
export const aiAPI = {
  generateMealPlan: () => api.post('/ai/meal-plan'),
  getExercises: () => api.post('/ai/exercises'),
  searchNutrition: (query) => api.post('/ai/nutrition-search', { query }),
  analyzeMeal: (mealDescription) => api.post('/ai/analyze-meal', { mealDescription }),
};

// Schedule API
export const scheduleAPI = {
  getSchedule: (params) => api.get('/schedule', { params }),
  createEntry: (data) => api.post('/schedule', data),
  updateEntry: (id, data) => api.put(`/schedule/${id}`, data),
  completeEntry: (id) => api.patch(`/schedule/${id}/complete`),
  deleteEntry: (id) => api.delete(`/schedule/${id}`),

  // Exercises
  getExercises: (params) => api.get('/schedule/exercises', { params }),
  createExercise: (data) => api.post('/schedule/exercises', data),
  completeExercise: (id) => api.patch(`/schedule/exercises/${id}/complete`),
  deleteExercise: (id) => api.delete(`/schedule/exercises/${id}`),
};

export default api;
