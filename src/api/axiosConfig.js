import axios from 'axios';

// IMPORTANT: Ensure API_BASE_URL points to backend server (port 5000 locally)
// In development, always use localhost:5000 (backend server)
// In production, use REACT_APP_API_URL or default to production backend
let API_BASE_URL;
if (process.env.NODE_ENV === 'development') {
  // Force localhost:5000 in development (override any incorrect env vars)
  API_BASE_URL = 'http://localhost:5000/api';
  console.log('🔍 Development mode - Using:', API_BASE_URL);
  if (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL !== API_BASE_URL) {
    console.warn('⚠️ WARNING: REACT_APP_API_URL is set but ignored in development:', process.env.REACT_APP_API_URL);
  }
} else {
  // Production: use env var or default to production backend
  API_BASE_URL = process.env.REACT_APP_API_URL || 'https://oorrdd-backend.onrender.com/api';
  console.log('🔍 Production mode - Using:', API_BASE_URL);
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds (increased for Render free tier)
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug: Log the full URL being requested
    if (process.env.NODE_ENV === 'development') {
      const fullUrl = `${config.baseURL}${config.url}`;
      console.log(`🌐 Making request to: ${config.method?.toUpperCase()} ${fullUrl}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle 429 (Too Many Requests) errors gracefully
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const delay = retryAfter ? parseInt(retryAfter) * 1000 : 5000; // Default 5 seconds
      
      // Log warning but don't retry automatically
      console.warn(`Rate limit exceeded. Please wait ${delay / 1000} seconds before trying again.`);
      
      // Don't retry automatically - let the component handle it
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 