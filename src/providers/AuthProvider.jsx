import { createContext, useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { parseApiError } from '@/utils/errorHandler';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  const fetchUser = useCallback(async () => {
    try {
      const res = await authService.me();
      if (res?.success && res.data) {
        setUser(res.data);
      } else {
        if (res?.message === 'An Admin Seized your Subscription') {
          localStorage.removeItem('auth_token');
          toast.error(res.message);
        }
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    if (res?.success && res.data?.access_token) {
      localStorage.setItem('auth_token', res.data.access_token);
      queryClient.clear();
      await fetchUser();
    }
    return res;
  };

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      const parsed = parseApiError(err);
      if (parsed.status !== 401) {
        toast.error(parsed.message);
      }
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
