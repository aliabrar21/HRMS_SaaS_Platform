import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth-store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetryableRequestConfig | undefined;
    const requestUrl = originalConfig?.url ?? '';
    const isAuthRequest = ['/auth/login', '/auth/refresh', '/auth/register', '/auth/google'].some(
      (path) => requestUrl.endsWith(path) || requestUrl.includes(path),
    );

    if (error.response?.status === 401 && originalConfig && !originalConfig._retry && !isAuthRequest) {
      originalConfig._retry = true;
      originalConfig.headers = originalConfig.headers ?? {};

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        const newToken = (refreshResponse.data as { data?: { accessToken?: string } }).data?.accessToken;
        const user = (refreshResponse.data as { data?: { user?: unknown } }).data?.user;

        if (newToken && user) {
          useAuthStore.getState().setAuth({ accessToken: newToken, user: user as never });
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
          return http(originalConfig);
        }
      } catch {
        useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  },
);
