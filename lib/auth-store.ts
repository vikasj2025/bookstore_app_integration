import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthStore } from '@/types/auth';
import { 
  storeAuthData, 
  clearAuthData, 
  isAuthenticated, 
  getCurrentUser, 
  logout as authLogout,
  refreshAccessToken
} from './auth';
import apiClient from './api-client';

export const useAuthStore = create<AuthStore>()(n  persist(
    (set, get) => ({
      // State
      isAuthenticated: false,
      isLoading: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      sessionId: null,
      error: null,

      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          // Initiate OAuth flow
          const initiateResponse = await apiClient.post('/auth/oauth/initiate', credentials);
          
          // Redirect to OAuth provider
          if (typeof window !== 'undefined') {
            window.location.href = initiateResponse.authorizationUrl;
          }
        } catch (error: any) {
          set({ 
            error: error.message || 'Login failed', 
            isLoading: false 
          });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authLogout();
        } catch (error: any) {
          console.error('Logout failed:', error);
        } finally {
          set({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            sessionId: null,
            error: null,
          });
        }
      },

      refreshToken: async () => {
        try {
          const newToken = await refreshAccessToken();
          if (newToken) {
            set({ accessToken: newToken, error: null });
          } else {
            // Refresh failed, clear auth state
            get().clearAuth();
          }
        } catch (error: any) {
          set({ error: error.message || 'Token refresh failed' });
          get().clearAuth();
        }
      },

      validateToken: async () => {
        try {
          const isValid = await isAuthenticated();
          if (isValid) {
            const user = getCurrentUser();
            set({ 
              isAuthenticated: true, 
              user,
              error: null 
            });
          } else {
            get().clearAuth();
          }
          return isValid;
        } catch (error: any) {
          set({ error: error.message || 'Token validation failed' });
          get().clearAuth();
          return false;
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setTokens: (tokens) => {
        set({ 
          accessToken: tokens.accessToken, 
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
          error: null
        });
      },

      clearAuth: () => {
        clearAuthData();
        set({
          isAuthenticated: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          sessionId: null,
          error: null,
        });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => {
        // Use sessionStorage for sensitive auth data
        return typeof window !== 'undefined' ? sessionStorage : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        // Only persist non-sensitive state
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

// Initialize auth state on app start
if (typeof window !== 'undefined') {
  const initializeAuth = async () => {
    const store = useAuthStore.getState();
    await store.validateToken();
  };
  
  initializeAuth();
}
