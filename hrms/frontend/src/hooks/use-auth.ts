import { useAuthStore } from '@/store/auth-store';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  return {
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
  };
};
