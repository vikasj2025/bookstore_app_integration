import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserResponse } from '@/types/api';
import { authService, AuthState } from '@/services/auth.service';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
  }) => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: UserResponse) => void;
  checkAuthStatus: () => void;
  clearAuth: () => void;
  
  // State
  isLoading: boolean;
  error: string | null;
  lastActivity: number;
}

export const useAuthStore = create<AuthStore>()()
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      tokens: null,
      isLoading: false,
      error: null,
      lastActivity: Date.now(),

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login({ email, password });
          const { user, accessToken, refreshToken, expiresIn } = response.data;
          
          set({
            isAuthenticated: true,
            user,
            tokens: {
              accessToken,
              refreshToken,
              expiresIn: Date.now() + (expiresIn * 1000),
            },
            isLoading: false,
            error: null,
            lastActivity: Date.now(),
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Login failed',
            isAuthenticated: false,
            user: null,
            tokens: null,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
        } catch (error) {
          console.warn('Logout service call failed:', error);
        } finally {
          set({
            isAuthenticated: false,
            user: null,
            tokens: null,
            isLoading: false,
            error: null,
            lastActivity: Date.now(),
          });
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          await authService.register(userData);
          
          // After successful registration, log the user in
          await get().login(userData.email, userData.password);
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Registration failed',
          });
          throw error;
        }
      },

      refreshToken: async () => {
        const { tokens } = get();
        
        if (!tokens?.refreshToken) {
          get().clearAuth();
          return;
        }
        
        try {
          const response = await authService.refreshToken();
          const { user, accessToken, refreshToken, expiresIn } = response.data;
          
          set({
            user,
            tokens: {
              accessToken,
              refreshToken,
              expiresIn: Date.now() + (expiresIn * 1000),
            },
            lastActivity: Date.now(),
          });
        } catch (error) {
          console.error('Token refresh failed:', error);
          get().clearAuth();
        }
      },

      updateUser: (user: UserResponse) => {
        set({ user, lastActivity: Date.now() });
      },

      checkAuthStatus: () => {
        const { tokens } = get();
        
        if (!tokens) {
          set({ isAuthenticated: false, user: null });
          return;
        }
        
        // Check if token is expired (with 5-minute buffer)
        const now = Date.now();
        const bufferTime = 5 * 60 * 1000; // 5 minutes
        
        if (now >= (tokens.expiresIn - bufferTime)) {
          // Token is expired or about to expire, try to refresh
          get().refreshToken();
        } else {
          // Token is still valid
          set({ isAuthenticated: true, lastActivity: Date.now() });
        }
      },

      clearAuth: () => {
        set({
          isAuthenticated: false,
          user: null,
          tokens: null,
          error: null,
          lastActivity: Date.now(),
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        tokens: state.tokens,
        lastActivity: state.lastActivity,
      }),
    }
  )
);

// Auto-check auth status on store initialization
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuthStatus();
  
  // Set up periodic token refresh check
  setInterval(() => {
    const store = useAuthStore.getState();
    if (store.isAuthenticated) {
      store.checkAuthStatus();
    }
  }, 60000); // Check every minute
  
  // Set up activity tracking
  const updateActivity = () => {
    const store = useAuthStore.getState();
    if (store.isAuthenticated) {
      useAuthStore.setState({ lastActivity: Date.now() });
    }
  };
  
  // Track user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true });
  });
  
  // Auto-logout after 30 minutes of inactivity
  setInterval(() => {
    const store = useAuthStore.getState();
    if (store.isAuthenticated) {
      const inactiveTime = Date.now() - store.lastActivity;
      const maxInactiveTime = 30 * 60 * 1000; // 30 minutes
      
      if (inactiveTime > maxInactiveTime) {
        console.log('Auto-logout due to inactivity');
        store.logout();
      }
    }
  }, 60000); // Check every minute
}

// Selectors for common use cases
export const useAuth = () => {
  const store = useAuthStore();
  return {
    isAuthenticated: store.isAuthenticated,
    user: store.user,
    isLoading: store.isLoading,
    error: store.error,
  };
};

export const useAuthActions = () => {
  const store = useAuthStore();
  return {
    login: store.login,
    logout: store.logout,
    register: store.register,
    updateUser: store.updateUser,
    clearAuth: store.clearAuth,
  };
};

export const useUser = () => {
  const user = useAuthStore(state => state.user);
  const updateUser = useAuthStore(state => state.updateUser);
  
  return {
    user,
    updateUser,
    isAdmin: user?.role === 'ADMIN',
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    initials: user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : '',
  };
};

export default useAuthStore;
