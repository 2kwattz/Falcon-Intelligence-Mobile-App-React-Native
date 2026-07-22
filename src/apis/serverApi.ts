import { apiClient } from './apiClient';
import { delay, mockSdrStatus, mockServerStatus } from './mockData';
import { USE_MOCK_API } from '@/constants/config';
import { SdrStatus, ServerStatus } from '@/types/dashboard';

export const getServerStatus = async (): Promise<ServerStatus> => {
  if (USE_MOCK_API) {
    await delay(340);
    return mockServerStatus;
  }
  const response = await apiClient.get<ServerStatus>('/api/status/server');
  return response.data;
};

export const getSdrStatus = async (): Promise<SdrStatus> => {
  if (USE_MOCK_API) {
    await delay(360);
    return mockSdrStatus;
  }
  const response = await apiClient.get<SdrStatus>('/api/status/sdr');
  return response.data;
};
