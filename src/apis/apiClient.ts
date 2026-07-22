import axios, { AxiosError } from 'axios';
import { API_TIMEOUT_MS, BASE_URL } from '@/constants/config';
import { storageService } from '@/services/storageService';
import { ApiErrorShape } from '@/types/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await storageService.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    const normalizedError: ApiErrorShape = {
      message:
        error.response?.data?.message ??
        (error.code === 'ECONNABORTED' ? 'The request timed out.' : 'Unable to reach Falcon Server.'),
      status: error.response?.status,
      code: error.code,
    };
    return Promise.reject(normalizedError);
  },
);
