import axios from 'axios';

// 1. Safe Environment Variable Access
// Vite uses import.meta.env, Webpack uses process.env
const getEnvVar = (key) => {
  // Check Vite first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[`VITE_${key}`];
  }
  // Fallback to process.env (for Webpack/CRA)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[`REACT_APP_${key}`];
  }
  return null;
};

const API_URL = getEnvVar('API_URL') || 'http://127.0.0.1:5000';

console.log('=== API CONFIGURATION ===');
console.log('Target Base URL:', API_URL);
console.log('=========================');

const api = axios.create({
  baseURL: API_URL,
});

// 2. Request Interceptor: Attach Auth Token
api.interceptors.request.use((config) => {
  try {
    const userStr = localStorage.getItem('gs_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
  } catch (error) {
    console.error('Auth Interceptor Error: Could not parse gs_user', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// 3. Response Interceptor: Error Handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Unauthorized: Token may be expired. Redirecting to login...');
      // Optional: Clear storage and redirect
      // localStorage.removeItem('gs_user');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- SERVICE EXPORTS ---

export const parkService = {
  getAllParks: async () => {
    try {
      const response = await api.get('/parks');
      return response.data;
    } catch (error) {
      console.error('Error fetching parks:', error);
      throw error;
    }
  },

  enrichPark: async (parkId) => {
    try {
      const response = await api.get(`/parks/${parkId}/enrich`);
      return response.data;
    } catch (error) {
      console.error('Error enriching park:', error);
      return null;
    }
  },
  
  getRecommendations: async (preference) => {
    try {
      const response = await api.post('/recommendations', { preference });
      return response.data.recommendations;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }
};

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (email, password) => {
    try {
      const response = await api.post('/auth/register', { email, password });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
};

export const chatbotService = {
  sendMessage: async (message) => {
    try {
      const response = await api.post('/chatbot', { message });
      return response.data.reply;
    } catch (error) {
      console.error('Chatbot error:', error);
      throw error;
    }
  }
};

export const communityService = {
  getAllReviews: async () => {
    try {
      const response = await api.get('/community');
      return response.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },

  submitReview: async (formData) => {
    try {
      const response = await api.post('/community', formData);
      return response.data;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }
};

export default api;