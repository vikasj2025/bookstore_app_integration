'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { User, AuthResponse, LoginRequest, UserRegistrationRequest } from '@/types/api';
import apiClient from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: UserRegistrationRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('accessToken');
      
      if (token) {
        try {
          const user = await apiClient.getUserProfile();
          dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } catch (error) {
          // Token might be expired, try to refresh
          const refreshToken = Cookies.get('refreshToken');
          if (refreshToken) {
            try {
              const response = await apiClient.refreshToken({ refreshToken });
              Cookies.set('accessToken', response.accessToken, { expires: 1 });
              Cookies.set('refreshToken', response.refreshToken, { expires: 7 });
              dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
            } catch (refreshError) {
              Cookies.remove('accessToken');
              Cookies.remove('refreshToken');
              dispatch({ type: 'AUTH_LOGOUT' });
            }
          } else {
            Cookies.remove('accessToken');
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        }
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response: AuthResponse = await apiClient.login(credentials);
      
      // Store tokens in cookies
      Cookies.set('accessToken', response.accessToken, { expires: 1 }); // 1 day
      Cookies.set('refreshToken', response.refreshToken, { expires: 7 }); // 7 days
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    }
  };

  const register = async (userData: UserRegistrationRequest) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response: AuthResponse = await apiClient.register(userData);
      
      // Store tokens in cookies
      Cookies.set('accessToken', response.accessToken, { expires: 1 });
      Cookies.set('refreshToken', response.refreshToken, { expires: 7 });
      
      dispatch({ type: 'AUTH_SUCCESS', payload: response.user });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error instanceof Error ? error.message : 'Registration failed' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const refreshUser = async () => {
    try {
      const user = await apiClient.getUserProfile();
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
