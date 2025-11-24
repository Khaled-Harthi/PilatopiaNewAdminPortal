import axios from 'axios';

// Create axios instance
const apiClient = axios.create({
  baseURL: 'https://api.pilatopia.studio/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error.response?.status;

      switch (status) {
        case 401:
          // Auto-logout and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('admin');
          window.location.href = '/login';
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error. Please try again later.');
          break;
        default:
          if (!error.response) {
            console.error('Network error. Please check your connection.');
          }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
