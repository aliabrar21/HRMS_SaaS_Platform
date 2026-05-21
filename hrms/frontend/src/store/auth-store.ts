import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@hrms/shared';

interface AuthState {
  accessToken: string | null;
  pendingTempToken: string | null;
  user: AuthUser | null;
  setAuth: (payload: { accessToken: string; user: AuthUser }) => void;
  setPendingTempToken: (tempToken: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      pendingTempToken: null,
      user: null,
      setAuth: ({ accessToken, user }) => set({ accessToken, user, pendingTempToken: null }),
      setPendingTempToken: (pendingTempToken) => set({ pendingTempToken }),
      clearAuth: () => set({ accessToken: null, user: null, pendingTempToken: null }),
    }),
    {
      name: 'hrms-auth',
    },
  ),
);
