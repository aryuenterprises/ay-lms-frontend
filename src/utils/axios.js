import axios from 'axios';
import { APP_PATH_BASE_URL } from 'config';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: APP_PATH_BASE_URL || 'http://localhost:8000/api'
});

// ✅ Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');

    // Public feedback API
    if (config.url?.includes('/feedback/')) {
      return config;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/feedback/') &&
      !window.location.href.includes('/login')
    ) {
      Cookies.remove('token');
      window.location.href = '/login';
    }

    return Promise.reject(error.response?.data || 'Request failed');
  }
);

export default axiosInstance;
