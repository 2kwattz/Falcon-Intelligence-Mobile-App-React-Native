import { apiClient } from './apiClient';
import { delay, mockSdrStatus } from './mockData';
import { USE_MOCK_API } from '@/constants/config';
import { SdrStatus, ServerStatus } from '@/types/dashboard';

// Keep this below the polling interval so an unreachable endpoint never blocks
// the following scheduled check.
const SERVER_STATUS_TIMEOUT_MS = 2_500;

export const getServerStatus = async (): Promise<ServerStatus> => {
  const startedAt = Date.now();

  try {
    // The base URL itself is the health check endpoint. Do not use mock data here:
    // server availability should always reflect the configured server.
    const response = await apiClient.get('/', { timeout: SERVER_STATUS_TIMEOUT_MS });
    return {
      online: true,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      statusCode: response.status,
    };
  } catch (requestError) {
    const error = requestError instanceof Error
      ? requestError.message
      : typeof requestError === 'object' && requestError && 'message' in requestError && typeof requestError.message === 'string'
        ? requestError.message
        : 'Unable to reach the server.';
    return {
      online: false,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      error,
    };
  }
};

export const getSdrStatus = async (): Promise<SdrStatus> => {
  if (USE_MOCK_API) {
    await delay(360);
    return mockSdrStatus;
  }
  const response = await apiClient.get<SdrStatus>('/api/status/sdr');
  return response.data;
};
