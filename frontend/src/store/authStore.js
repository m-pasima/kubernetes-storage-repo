import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      login: async (emailOrUsername, password) => {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailOrUsername, password }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        set({ token: data.token, user: data.user });
        return data;
      },

      register: async (email, username, password, fullName) => {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, username, password, fullName }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Registration failed');
        }

        const data = await response.json();
        set({ token: data.token, user: data.user });
        return data;
      },

      logout: () => {
        set({ token: null, user: null });
      },

      fetchUser: async () => {
        const token = get().token;
        if (!token) return;

        const response = await fetch(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const user = await response.json();
          set({ user });
        }
      },

      fetchSessions: async () => {
        const token = get().token;
        if (!token) return [];

        const response = await fetch(`${API_URL}/api/user/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          return data.sessions;
        }
        return [];
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
