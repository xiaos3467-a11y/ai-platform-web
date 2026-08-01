/** Auth state management */

import { create } from 'zustand';
import type { UserInfo } from '@/types';

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('ai_platform_token'),
  isAuthenticated: !!localStorage.getItem('ai_platform_token'),

  login: (token: string, user: UserInfo) => {
    localStorage.setItem('ai_platform_token', token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('ai_platform_token');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
