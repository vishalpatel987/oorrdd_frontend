import axiosInstance from './axiosConfig';

const authAPI = {
  // Register new user
  register: (userData) => {
    return axiosInstance.post('/auth/register', userData);
  },

  // New: Registration with email OTP
  registerStart: (userData) => {
    return axiosInstance.post('/auth/register/start', userData);
  },
  registerVerify: (payload) => {
    return axiosInstance.post('/auth/register/verify', payload); // { email, otp }
  },

  // Login user
  login: (credentials) => {
    return axiosInstance.post('/auth/login', credentials);
  },

  // Get current user
  getCurrentUser: () => {
    return axiosInstance.get('/auth/me');
  },

  // Update user profile
  updateProfile: (userData) => {
    return axiosInstance.put('/users/profile', userData);
  },

  // Forgot password
  forgotPassword: (email) => {
    return axiosInstance.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: (token, password) => {
    return axiosInstance.put(`/auth/reset-password/${token}`, { password });
  },

  // Forgot password via OTP (enabled)
  forgotPasswordOTP: (email) => axiosInstance.post('/auth/forgot-password-otp', { email }),
  verifyPasswordOTP: (payload) => axiosInstance.post('/auth/verify-otp', payload), // { email, otp }
  resetPasswordWithOTP: (payload) => axiosInstance.put('/auth/reset-password-otp', payload), // { email, password, confirmPassword }

  // Verify email
  verifyEmail: (token) => {
    return axiosInstance.get(`/auth/verify-email/${token}`);
  },

  // Admin registration (only if no admin exists)
  adminRegisterStart: (userData) => {
    return axiosInstance.post('/auth/admin-register/start', userData);
  },
  adminRegisterVerify: (payload) => {
    return axiosInstance.post('/auth/admin-register/verify', payload); // { email, otp }
  },
};

export default authAPI; 