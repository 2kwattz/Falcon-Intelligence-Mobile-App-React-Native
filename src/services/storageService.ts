import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/auth';

const TOKEN_KEY = '@falcon_intelligence/auth_token';
const USER_KEY = '@falcon_intelligence/auth_user';

export const storageService = {
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async getUser(): Promise<User | null> {
    const value = await AsyncStorage.getItem(USER_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as User;
    } catch {
      await AsyncStorage.removeItem(USER_KEY);
      return null;
    }
  },

  async saveSession(token: string, user: User): Promise<void> {
    await AsyncStorage.multiSet([
      [TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(user)],
    ]);
  },

  async clearSession(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};
