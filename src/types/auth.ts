export interface User {
  id: string;
  name: string;
  email: string;
  role: 'operator' | 'admin';
  initials: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isHydrating: boolean;
  isAuthenticated: boolean;
}
