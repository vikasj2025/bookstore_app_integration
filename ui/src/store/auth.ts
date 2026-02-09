import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';
import { AuthState, User } from '@/types';
import { AuthService } from '@/services/auth.service';

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

const TOKEN_COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  expires: 7, // 7 days
};

const ACCESS_TOKEN_COOKIE_OPTIONS = {
  ...TOKEN_COOKIE_OPTIONS,
  expires: 1 / 24, // 1 hour
};

export const authStore = create<AuthStore>()(n  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        // Store tokens in cookies for security
        Cookies.set('accessToken', accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
        Cookies.set('refreshToken', refreshToken, TOKEN_COOKIE_OPTIONS);
        
        set({
          accessToken,
          refreshToken,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await AuthService.login({ email, password });
          
          get().setTokens(response.accessToken, response.refreshToken);
          get().setUser(response.user);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await AuthService.register(data);
          
          get().setTokens(response.accessToken, response.refreshToken);
          get().setUser(response.user);
          
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        // Clear cookies
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        
        // Clear state
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
        
        // Call logout API (fire and forget)
        AuthService.logout().catch(console.error);
      },

      refreshToken: async () => {
        try {
          const { refreshToken } = get();
          
          if (!refreshToken) {
            return false;
          }
          
          const response = await AuthService.refreshToken({ refreshToken });
          
          get().setTokens(response.accessToken, response.refreshToken);
          get().setUser(response.user);
          
          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().logout();
          return false;
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          
          // Check for tokens in cookies
          const accessToken = Cookies.get('accessToken');
          const refreshToken = Cookies.get('refreshToken');
          
          if (!accessToken || !refreshToken) {
            set({ isLoading: false });
            return;
          }
          
          // Check if access token is expired
          if (AuthService.isTokenExpired(accessToken)) {
            // Try to refresh token
            const refreshed = await get().refreshToken();
            if (!refreshed) {
              set({ isLoading: false });
              return;
            }
          } else {
            // Token is valid, set it in state
            set({ accessToken, refreshToken });
          }
          
          // Get user profile
          const user = await AuthService.getProfile();
          get().setUser(user);
          
        } catch (error) {
          console.error('Auth check failed:', error);
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist user data, not tokens (tokens are in cookies)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper hooks
export const useAuth = () => {
  const store = authStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    register: store.register,
    logout: store.logout,
    clearError: store.clearError,
  };
};

export const useAuthActions = () => {
  const store = authStore();
  return {
    login: store.login,
    register: store.register,
    logout: store.logout,
    checkAuth: store.checkAuth,
    clearError: store.clearError,
  };
};

export const useUser = () => {
  return authStore((state) => state.user);
};

export const useIsAuthenticated = () => {
  return authStore((state) => state.isAuthenticated);
};

export default authStore;
