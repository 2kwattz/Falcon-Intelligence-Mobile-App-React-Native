import { delay } from './mockData';

export const getConnectedUserCount = async (): Promise<number> => {
  await delay(180);
  return 7;
};
