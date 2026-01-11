import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        set({
          user: userData,
          token: token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        set({ user: userData });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
