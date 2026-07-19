import axios from 'axios';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const SUSPENDED_MSG = 'Your account is suspended';

function forceLogout(message) {
  localStorage.removeItem('auth_token');
  window.location.href = '/login';
  setTimeout(() => alert(message), 100);
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://api.stpmanagement.devbd.pro/api' : '/api');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errMsg = error.response?.data?.message;

    if (
      originalRequest.url.includes('/auth/refresh') &&
      errMsg &&
      (errMsg === SUSPENDED_MSG || errMsg === 'An Admin Seized your Subscription')
    ) {
      processQueue(error, null);
      forceLogout(errMsg);
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh') &&
      !originalRequest.url.includes('/public/') &&
      !originalRequest.url.includes('/bd-address/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data?.data?.access_token;
        if (newToken) {
          localStorage.setItem('auth_token', newToken);
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
        // Non-401 error from refresh (e.g., user suspended, institute seized)
        const refreshMsg = data?.message;
        if (refreshMsg) {
          processQueue(error, null);
          forceLogout(refreshMsg);
          return Promise.reject(new Error(refreshMsg));
        }
        throw new Error('No token in refresh response');
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (refreshError?.response?.data?.message === SUSPENDED_MSG) {
          forceLogout(SUSPENDED_MSG);
        } else {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
