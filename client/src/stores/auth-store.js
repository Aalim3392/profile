import { create } from 'zustand';
import toast from 'react-hot-toast';
import { api } from '@/lib/api.js';

const storageKey = 'hrms-pro-token';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem(storageKey),
  loading: true,
  loginLoading: false,

  initializeAuth: async () => {
    const token = localStorage.getItem(storageKey);

    if (!token) {
      set({ token: null, user: null, loading: false });
      return;
    }

    try {
      const { data } = await api.get('/api/auth/me');
      set({ token, user: data.user, loading: false });
    } catch (_error) {
      localStorage.removeItem(storageKey);
      set({ token: null, user: null, loading: false });
    }
  },

  login: async (credentials) => {
    set({ loginLoading: true });

    try {
      const { data } = await api.post('/api/auth/login', credentials);
      localStorage.setItem(storageKey, data.token);
      set({
        token: data.token,
        user: data.user,
        loginLoading: false,
      });
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
      return data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to sign in.';
      toast.error(message);
      set({ loginLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (_error) {
    } finally {
      localStorage.removeItem(storageKey);
      set({ token: null, user: null, loading: false });
      toast.success('You have been logged out.');
    }
  },

  setUser: (user) => set({ user }),

  getRedirectPath: () => {
    const user = get().user;
    if (!user) {
      return '/login';
    }

    return user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
  },
}));
