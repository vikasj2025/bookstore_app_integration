import {
  getAccessToken,
  getRefreshToken,
  getUserInfo,
  storeAuthData,
  clearAuthData,
  validateToken,
  refreshAccessToken,
  isAuthenticated,
  hasRole,
  hasPermission,
} from '@/lib/auth';
import { AuthenticationResponse } from '@/types/auth';
import Cookies from 'js-cookie';

// Mock js-cookie
jest.mock('js-cookie');
const mockCookies = Cookies as jest.Mocked<typeof Cookies>;

// Mock jose
jest.mock('jose', () => ({
  jwtVerify: jest.fn(),
}));

// Mock API client
jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

describe('Auth Library', () => {
  const mockAuthResponse: AuthenticationResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: {
      userId: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      roles: ['user', 'admin'],
      permissions: ['read', 'write'],
    },
    sessionId: 'session-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  describe('Token Management', () => {
    it('should get access token from cookies', () => {
      mockCookies.get.mockReturnValue('mock-token');
      const token = getAccessToken();
      expect(token).toBe('mock-token');
      expect(mockCookies.get).toHaveBeenCalledWith('access_token');
    });

    it('should get refresh token from cookies', () => {
      mockCookies.get.mockReturnValue('mock-refresh-token');
      const token = getRefreshToken();
      expect(token).toBe('mock-refresh-token');
      expect(mockCookies.get).toHaveBeenCalledWith('refresh_token');
    });

    it('should return null when no token exists', () => {
      mockCookies.get.mockReturnValue(undefined);
      const token = getAccessToken();
      expect(token).toBeNull();
    });
  });

  describe('User Info Management', () => {
    it('should get user info from localStorage', () => {
      const mockUserInfo = JSON.stringify(mockAuthResponse.user);
      (window.localStorage.getItem as jest.Mock).mockReturnValue(mockUserInfo);
      
      const userInfo = getUserInfo();
      expect(userInfo).toEqual(mockAuthResponse.user);
      expect(window.localStorage.getItem).toHaveBeenCalledWith('user_info');
    });

    it('should return null when no user info exists', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      const userInfo = getUserInfo();
      expect(userInfo).toBeNull();
    });
  });

  describe('Auth Data Storage', () => {
    it('should store authentication data', () => {
      storeAuthData(mockAuthResponse);
      
      expect(mockCookies.set).toHaveBeenCalledWith(
        'access_token',
        mockAuthResponse.accessToken,
        expect.objectContaining({
          secure: false, // NODE_ENV is test
          sameSite: 'strict',
        })
      );
      
      expect(mockCookies.set).toHaveBeenCalledWith(
        'refresh_token',
        mockAuthResponse.refreshToken,
        expect.any(Object)
      );
      
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'user_info',
        JSON.stringify(mockAuthResponse.user)
      );
    });

    it('should clear authentication data', () => {
      clearAuthData();
      
      expect(mockCookies.remove).toHaveBeenCalledWith('access_token');
      expect(mockCookies.remove).toHaveBeenCalledWith('refresh_token');
      expect(mockCookies.remove).toHaveBeenCalledWith('session_id');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('user_info');
    });
  });

  describe('Role and Permission Checks', () => {
    beforeEach(() => {
      const mockUserInfo = JSON.stringify(mockAuthResponse.user);
      (window.localStorage.getItem as jest.Mock).mockReturnValue(mockUserInfo);
    });

    it('should check if user has role', () => {
      expect(hasRole('admin')).toBe(true);
      expect(hasRole('user')).toBe(true);
      expect(hasRole('manager')).toBe(false);
    });

    it('should check if user has permission', () => {
      expect(hasPermission('read')).toBe(true);
      expect(hasPermission('write')).toBe(true);
      expect(hasPermission('delete')).toBe(false);
    });

    it('should return false when no user info', () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      expect(hasRole('admin')).toBe(false);
      expect(hasPermission('read')).toBe(false);
    });
  });

  describe('Server-side behavior', () => {
    const originalWindow = global.window;

    beforeAll(() => {
      // @ts-ignore
      delete global.window;
    });

    afterAll(() => {
      global.window = originalWindow;
    });

    it('should return null for token functions on server', () => {
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
      expect(getUserInfo()).toBeNull();
    });

    it('should not throw when storing auth data on server', () => {
      expect(() => storeAuthData(mockAuthResponse)).not.toThrow();
      expect(() => clearAuthData()).not.toThrow();
    });
  });
});
