import { apiClient } from './apiClient';
import { delay, mockSdrStatus } from './mockData';
import { USE_MOCK_API } from '@/constants/config';
import { SdrStatus, ServerStatus } from '@/types/dashboard';

// Keep this below the polling interval so an unreachable endpoint never blocks
// the following scheduled check.
const SERVER_STATUS_TIMEOUT_MS = 2_500;

export const getServerStatus = async (): Promise<ServerStatus> => {
  const startedAt = Date.now();
  const requestUrl = apiClient.getUri({ url: '/' });

  try {
    // A response from the host proves it is reachable, including a 4xx/5xx response.
    // `validateStatus` prevents Axios from treating a missing route (404) as a
    // connection failure, which are two different problems.
    console.info(`[Server check] Sending GET ${requestUrl}`);
    const response = await apiClient.get('/', {
      timeout: SERVER_STATUS_TIMEOUT_MS,
      validateStatus: () => true,
    });
    console.info(`[Server check] Received HTTP ${response.status} from ${requestUrl}`);

    return {
      online: true,
      latencyMs: Date.now() - startedAt,
      checkedAt: new Date().toISOString(),
      statusCode: response.status,
      requestUrl,
      routeAvailable: response.status >= 200 && response.status < 400,
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
      requestUrl,
      error: `No HTTP response for GET ${requestUrl}. ${error}`,
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
