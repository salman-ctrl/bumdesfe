import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

// Request interceptor - add JWT token to every request
axiosInstance.interceptors.request.use(
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

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Return only the data object from successful responses
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Redirect to login if not already there
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      
      // Return error message from backend
      return Promise.reject({
        message: data.message || 'Terjadi kesalahan pada server',
        status,
        data
      });
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
        status: 0
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'Terjadi kesalahan',
        status: 0
      });
    }
  }
);

export default axiosInstance;