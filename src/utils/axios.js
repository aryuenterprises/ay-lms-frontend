import axios from 'axios';
import { APP_PATH_BASE_URL } from 'config';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: APP_PATH_BASE_URL || 'http://localhost:3000/'
});

// ✅ Attach token to every request from cookies
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token'); // Corrected: Use Cookies.get() to retrieve token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Handle 401 Unauthorized errors (token expired)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.href.includes('/login')) {
      Cookies.remove('token'); // Use js-cookie to remove token consistently
      window.location.href = '/login'; // Redirect to login
    }
    return Promise.reject(error.response?.data || 'Request failed');
  }
);

export default axiosInstance;
