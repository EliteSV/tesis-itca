import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { User, UserRole } from '@/types/auth.types';
import { encryptedStorage } from '@/lib/storage.utils';

function getStoredUser(): Promise<User | null> {
  return encryptedStorage.getItem('user').then((userStr) => {
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  });
}

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      const [storedUser, storedToken] = await Promise.all([
        getStoredUser(),
        encryptedStorage.getItem('token'),
      ]);

      const cachedUser = queryClient.getQueryData<User>(['user']);
      const finalUser = cachedUser ?? storedUser;
      setUser(finalUser);
      setToken(storedToken);
      setIsLoading(false);
    };

    void loadAuth();
  }, [queryClient]);

  useEffect(() => {
    const subscription = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === 'user' && event.type === 'updated') {
        const updatedUser = queryClient.getQueryData<User>(['user']);
        if (updatedUser) {
          setUser(updatedUser);
        }
      }
    });

    return () => {
      subscription();
    };
  }, [queryClient]);

  const isAuthenticated = !!user && !!token;

  const logout = () => {
    encryptedStorage.removeItem('token');
    encryptedStorage.removeItem('user');
    import('@/lib/api').then(({ clearAuthToken }) => {
      clearAuthToken();
    });
    queryClient.clear();
    setUser(null);
    setToken(null);
    navigate('/login');
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    logout,
    hasRole,
    hasAnyRole,
  };
}

