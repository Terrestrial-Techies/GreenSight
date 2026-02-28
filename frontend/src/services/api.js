// Add this at the very top of api.js
console.log('=== BUILD TIME DEBUG ===');
console.log('REACT_APP_API_URL at build time:', JSON.stringify(process.env.REACT_APP_API_URL));
console.log('All REACT_APP env vars:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP')));
console.log('========================');

import axios from 'axios';

// Use environment variable with fallback for development
const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

console.log('API URL:', API_URL); // Helpful for debugging

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to include auth token
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('gs_user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Unauthorized - token may be expired');
    }
    return Promise.reject(error);
  }
);

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
