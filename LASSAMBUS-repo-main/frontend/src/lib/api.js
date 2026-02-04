import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE_URL = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token to requests
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

// Response interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/';
        toast.error('Session expired. Please login again.');
      }
    }
    
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }).then((res) => res.data),
  
  register: (userData) =>
    api.post('/auth/register', userData).then((res) => res.data),
};

// Incidents API
export const incidentsAPI = {
  create: (incidentData) =>
    api.post('/incidents', incidentData).then((res) => res.data),
  
  getAll: (params = {}) =>
    api.get('/incidents', { params }).then((res) => res.data),
  
  update: (incidentId, updateData) =>
    api.patch(`/incidents/${incidentId}`, updateData).then((res) => res.data),
};

// Hospitals API
export const hospitalsAPI = {
  getAll: () =>
    api.get('/hospitals').then((res) => res.data),
  
  getNearby: (lat, lon, condition = null) => {
    const params = { lat, lon };
    if (condition) params.condition = condition;
    return api.get('/hospitals/nearby', { params }).then((res) => res.data);
  },
};

export default api;
