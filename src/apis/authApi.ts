import { apiClient } from './apiClient';
import { delay } from './mockData';
import { USE_MOCK_API } from '@/constants/config';
import { AuthResponse } from '@/types/auth';

export const login = async (email: string, password: string, referralCode?: string): Promise<AuthResponse> => {
  if (USE_MOCK_API) {
    await delay(850);
    return {
      token: `mock.jwt.${Date.now()}`,
      user: {
        id: 'usr-roshan-01',
        name: 'Roshan Bhatia',
        email: email.trim().toLowerCase(),
        role: 'operator',
        initials: 'RB',
      },
    };
  }
  const response = await apiClient.post<AuthResponse>('/api/auth/login', {
    email,
    password,
    ...(referralCode ? { referralCode } : {}),
  });
  return response.data;
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
  if (USE_MOCK_API) {
    await delay();
    return { message: `Recovery instructions sent to ${email.trim().toLowerCase()}.` };
  }
  const response = await apiClient.post<{ message: string }>('/api/auth/forgot-password', { email });
  return response.data;
};
