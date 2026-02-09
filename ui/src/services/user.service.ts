import { apiClient } from './api-client';
import {
  UserResponse,
  UpdateUserRequest,
  Address,
  ApiResponse,
} from '@/types/api';

export interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  orderUpdates: boolean;
  newsletter: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
}

export interface UserStats {
  totalOrders: number;
  totalSpent: number;
  favoriteCategory: string;
  memberSince: string;
  loyaltyPoints: number;
}

export class UserService {
  private readonly basePath = '/users';

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<UserResponse>> {
    return apiClient.get<UserResponse>(`${this.basePath}/profile`);
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: UpdateUserRequest): Promise<ApiResponse<UserResponse>> {
    return apiClient.put<UserResponse>(`${this.basePath}/profile`, userData);
  }

  /**
   * Update user address
   */
  async updateAddress(address: Address): Promise<ApiResponse<UserResponse>> {
    return this.updateProfile({ address });
  }

  /**
   * Change password
   */
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${this.basePath}/change-password`, passwordData);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/forgot-password`, { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(resetData: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/reset-password`, resetData);
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/verify-email`, { token });
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${this.basePath}/resend-verification`, {});
  }

  /**
   * Update email address
   */
  async updateEmail(emailData: {
    newEmail: string;
    password: string;
  }): Promise<ApiResponse<void>> {
    return apiClient.put<void>(`${this.basePath}/update-email`, emailData);
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<ApiResponse<UserPreferences>> {
    return apiClient.get<UserPreferences>(`${this.basePath}/preferences`);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> {
    return apiClient.put<UserPreferences>(`${this.basePath}/preferences`, preferences);
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<ApiResponse<UserStats>> {
    return apiClient.get<UserStats>(`${this.basePath}/stats`);
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/account`, {
      data: { password },
    });
  }

  /**
   * Export user data (GDPR compliance)
   */
  async exportUserData(): Promise<ApiResponse<Blob>> {
    return apiClient.get<Blob>(`${this.basePath}/export`, {
      headers: {
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Get user's saved addresses
   */
  async getSavedAddresses(): Promise<ApiResponse<Address[]>> {
    return apiClient.get<Address[]>(`${this.basePath}/addresses`);
  }

  /**
   * Add new address
   */
  async addAddress(address: Address): Promise<ApiResponse<Address>> {
    return apiClient.post<Address>(`${this.basePath}/addresses`, address);
  }

  /**
   * Update saved address
   */
  async updateSavedAddress(addressId: string, address: Address): Promise<ApiResponse<Address>> {
    return apiClient.put<Address>(`${this.basePath}/addresses/${addressId}`, address);
  }

  /**
   * Delete saved address
   */
  async deleteAddress(addressId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.basePath}/addresses/${addressId}`);
  }

  /**
   * Set default address
   */
  async setDefaultAddress(addressId: string): Promise<ApiResponse<Address>> {
    return apiClient.put<Address>(`${this.basePath}/addresses/${addressId}/default`, {});
  }

  /**
   * Validate user profile data
   */
  validateProfileData(userData: UpdateUserRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Name validation
    if (userData.firstName !== undefined && (!userData.firstName || userData.firstName.trim().length === 0)) {
      errors.push('First name cannot be empty');
    }
    
    if (userData.lastName !== undefined && (!userData.lastName || userData.lastName.trim().length === 0)) {
      errors.push('Last name cannot be empty');
    }
    
    // Phone number validation
    if (userData.phoneNumber !== undefined && userData.phoneNumber) {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(userData.phoneNumber)) {
        errors.push('Invalid phone number format');
      }
    }
    
    // Address validation
    if (userData.address) {
      if (userData.address.street && userData.address.street.trim().length === 0) {
        errors.push('Street address cannot be empty');
      }
      
      if (userData.address.city && userData.address.city.trim().length === 0) {
        errors.push('City cannot be empty');
      }
      
      if (userData.address.zipCode && !/^\d{5}(-\d{4})?$/.test(userData.address.zipCode)) {
        errors.push('Invalid ZIP code format');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate password change data
   */
  validatePasswordChange(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!passwordData.currentPassword) {
      errors.push('Current password is required');
    }
    
    if (!passwordData.newPassword) {
      errors.push('New password is required');
    } else {
      if (passwordData.newPassword.length < 8) {
        errors.push('New password must be at least 8 characters long');
      }
      
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
        errors.push('New password must contain at least one uppercase letter, one lowercase letter, and one number');
      }
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push('New password and confirmation do not match');
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.push('New password must be different from current password');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate address data
   */
  validateAddress(address: Address): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!address.street || address.street.trim().length === 0) {
      errors.push('Street address is required');
    }
    
    if (!address.city || address.city.trim().length === 0) {
      errors.push('City is required');
    }
    
    if (!address.state || address.state.trim().length === 0) {
      errors.push('State is required');
    }
    
    if (!address.zipCode || !/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
      errors.push('Valid ZIP code is required');
    }
    
    if (!address.country || address.country.trim().length === 0) {
      errors.push('Country is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format user's full name
   */
  formatFullName(user: UserResponse): string {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  /**
   * Format user's display name
   */
  formatDisplayName(user: UserResponse): string {
    const fullName = this.formatFullName(user);
    return fullName || user.email.split('@')[0] || 'User';
  }

  /**
   * Format address for display
   */
  formatAddress(address: Address): string {
    const parts = [
      address.street,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  /**
   * Get user's initials
   */
  getUserInitials(user: UserResponse): string {
    const firstInitial = user.firstName?.charAt(0).toUpperCase() || '';
    const lastInitial = user.lastName?.charAt(0).toUpperCase() || '';
    
    if (firstInitial && lastInitial) {
      return `${firstInitial}${lastInitial}`;
    }
    
    if (firstInitial) {
      return firstInitial;
    }
    
    return user.email.charAt(0).toUpperCase();
  }

  /**
   * Check if user profile is complete
   */
  isProfileComplete(user: UserResponse): boolean {
    const requiredFields = [
      user.firstName,
      user.lastName,
      user.email,
    ];
    
    return requiredFields.every(field => field && field.trim().length > 0);
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompletionPercentage(user: UserResponse): number {
    const fields = [
      user.firstName,
      user.lastName,
      user.email,
      user.phoneNumber,
      user.address?.street,
      user.address?.city,
      user.address?.state,
      user.address?.zipCode,
      user.address?.country,
    ];
    
    const completedFields = fields.filter(field => field && field.trim().length > 0).length;
    const totalFields = fields.length;
    
    return Math.round((completedFields / totalFields) * 100);
  }

  /**
   * Get default user preferences
   */
  getDefaultPreferences(): UserPreferences {
    return {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
      orderUpdates: true,
      newsletter: false,
      theme: 'system',
      language: 'en',
      currency: 'USD',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}

// Create singleton instance
export const userService = new UserService();
export default userService;
