/**
 * Authentication Store using Zustand
 * Manages authentication state across the application
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserInfo, LoginRequest, UserRegistrationRequest } from '@/types/api';
import { getAuthService } from '@/lib/container';

interface AuthState {
  // State
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: UserRegistrationRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  setUser: (user: UserInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
  getUserInitials: () => string;
  getFullName: () => string;
}

export const useAuthStore = create<AuthState>()(n  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const authService = getAuthService();
          const response = await authService.login(credentials);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Login failed',
          });
          throw error;
        }
      },

      register: async (userData: UserRegistrationRequest) => {
        set({ isLoading: true, error: null });
        
        try {
          const authService = getAuthService();
          const response = await authService.register(userData);
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Registration failed',
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          const authService = getAuthService();
          await authService.logout();
        } catch (error) {
          // Continue with logout even if server call fails
          console.warn('Logout API call failed:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshToken: async () => {
        try {
          const authService = getAuthService();
          const response = await authService.refreshToken();
          
          set({
            user: response.user,
            isAuthenticated: true,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            error: error.message || 'Token refresh failed',
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setUser: (user: UserInfo | null) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      // Computed properties
      isAdmin: () => {
        const { user } = get();
        return user?.role === 'ADMIN';
      },

      hasRole: (role: string) => {
        const { user } = get();
        return user?.role === role;
      },

      getUserInitials: () => {
        const { user } = get();
        if (!user) return '';
        
        const firstInitial = user.firstName.charAt(0).toUpperCase();
        const lastInitial = user.lastName.charAt(0).toUpperCase();
        
        return `${firstInitial}${lastInitial}`;
      },

      getFullName: () => {
        const { user } = get();
        if (!user) return '';
        
        return `${user.firstName} ${user.lastName}`.trim();
      },
    }),
    {
      name: 'bookstore-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Selectors for better performance
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error,
}));

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  refreshToken: state.refreshToken,
  clearError: state.clearError,
  setUser: state.setUser,
  setLoading: state.setLoading,
  setError: state.setError,
}));

export const useAuthComputed = () => useAuthStore((state) => ({
  isAdmin: state.isAdmin,
  hasRole: state.hasRole,
  getUserInitials: state.getUserInitials,
  getFullName: state.getFullName,
}));
