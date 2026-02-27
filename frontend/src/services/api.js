import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000';

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

  // Fetches DB park data + Gemini-enriched fields (DB always takes priority)
  enrichPark: async (parkId) => {
    try {
      const response = await api.get(`/parks/${parkId}/enrich`);
      return response.data;
    } catch (error) {
      console.error('Error enriching park:', error);
      return null; // Graceful fallback
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
    const response = await api.get('/community');
    return response.data;
  },

  submitReview: async (formData) => {
    const response = await api.post('/community', formData);
    return response.data;
  }
};

export default api;
