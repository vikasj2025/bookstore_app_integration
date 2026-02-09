/**
 * User Service for the Online Bookstore Application
 * Handles user profile management operations
 */

import {
  UserProfile,
  UpdateUserProfileRequest,
} from '@/types/api';
import { ApiClient } from '@/services/api/client';
import { LoggerService } from '@/services/logger';
import { apiEndpoints } from '@/config/app';

export class UserService {
  private apiClient: ApiClient;
  private logger: LoggerService;
  private currentProfile: UserProfile | null = null;
  private profileListeners: Array<(profile: UserProfile | null) => void> = [];

  constructor(apiClient: ApiClient, logger: LoggerService) {
    this.apiClient = apiClient;
    this.logger = logger.createChild('UserService');
  }

  /**
   * Get current user's profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      this.logger.debug('Fetching user profile');
      
      const response = await this.apiClient.get<UserProfile>(
        apiEndpoints.user.profile
      );

      this.currentProfile = response;
      this.notifyProfileChange(response);
      
      this.logger.debug('User profile fetched successfully');
      return response;
    } catch (error) {
      this.logger.error('Failed to fetch user profile:', error);
      throw error;
    }
  }

  /**
   * Update user's profile
   */
  async updateProfile(profileData: UpdateUserProfileRequest): Promise<UserProfile> {
    try {
      this.logger.info('Updating user profile');
      
      const response = await this.apiClient.put<UserProfile>(
        apiEndpoints.user.updateProfile,
        profileData
      );

      this.currentProfile = response;
      this.notifyProfileChange(response);
      
      this.logger.info('User profile updated successfully');
      return response;
    } catch (error) {
      this.logger.error('Failed to update user profile:', error);
      throw error;
    }
  }

  /**
   * Get cached profile (if available)
   */
  getCachedProfile(): UserProfile | null {
    return this.currentProfile;
  }

  /**
   * Clear cached profile
   */
  clearProfile(): void {
    this.currentProfile = null;
    this.notifyProfileChange(null);
    this.logger.debug('User profile cache cleared');
  }

  /**
   * Subscribe to profile changes
   */
  onProfileChange(callback: (profile: UserProfile | null) => void): () => void {
    this.profileListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.profileListeners.indexOf(callback);
      if (index > -1) {
        this.profileListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get user's full name
   */
  getFullName(profile?: UserProfile): string {
    const userProfile = profile || this.currentProfile;
    if (!userProfile) return '';
    
    return `${userProfile.firstName} ${userProfile.lastName}`.trim();
  }

  /**
   * Get user's initials
   */
  getInitials(profile?: UserProfile): string {
    const userProfile = profile || this.currentProfile;
    if (!userProfile) return '';
    
    const firstInitial = userProfile.firstName.charAt(0).toUpperCase();
    const lastInitial = userProfile.lastName.charAt(0).toUpperCase();
    
    return `${firstInitial}${lastInitial}`;
  }

  /**
   * Check if profile is complete
   */
  isProfileComplete(profile?: UserProfile): boolean {
    const userProfile = profile || this.currentProfile;
    if (!userProfile) return false;
    
    const requiredFields = [
      userProfile.firstName,
      userProfile.lastName,
      userProfile.email,
    ];
    
    return requiredFields.every(field => field && field.trim().length > 0);
  }

  /**
   * Get missing profile fields
   */
  getMissingProfileFields(profile?: UserProfile): string[] {
    const userProfile = profile || this.currentProfile;
    if (!userProfile) return ['All profile information'];
    
    const missingFields: string[] = [];
    
    if (!userProfile.firstName?.trim()) {
      missingFields.push('First name');
    }
    
    if (!userProfile.lastName?.trim()) {
      missingFields.push('Last name');
    }
    
    if (!userProfile.email?.trim()) {
      missingFields.push('Email');
    }
    
    if (!userProfile.phoneNumber?.trim()) {
      missingFields.push('Phone number');
    }
    
    if (!userProfile.addresses || userProfile.addresses.length === 0) {
      missingFields.push('Address');
    }
    
    return missingFields;
  }

  /**
   * Get user's primary address
   */
  getPrimaryAddress(profile?: UserProfile) {
    const userProfile = profile || this.currentProfile;
    if (!userProfile?.addresses || userProfile.addresses.length === 0) {
      return null;
    }
    
    // Return the first address as primary (in a real app, you might have a flag)
    return userProfile.addresses[0];
  }

  /**
   * Format address for display
   */
  formatAddress(address: any): string {
    if (!address) return '';
    
    const parts = [
      address.street,
      address.apartment,
      address.city,
      address.state,
      address.zipCode,
      address.country,
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  /**
   * Validate profile data
   */
  validateProfileData(data: UpdateUserProfileRequest): string[] {
    const errors: string[] = [];
    
    if (data.firstName !== undefined) {
      if (!data.firstName.trim()) {
        errors.push('First name is required');
      } else if (data.firstName.length > 50) {
        errors.push('First name must be 50 characters or less');
      }
    }
    
    if (data.lastName !== undefined) {
      if (!data.lastName.trim()) {
        errors.push('Last name is required');
      } else if (data.lastName.length > 50) {
        errors.push('Last name must be 50 characters or less');
      }
    }
    
    if (data.phoneNumber !== undefined) {
      if (data.phoneNumber && data.phoneNumber.length > 20) {
        errors.push('Phone number must be 20 characters or less');
      }
      
      // Basic phone number validation
      if (data.phoneNumber && !/^[+]?[\d\s\-\(\)]+$/.test(data.phoneNumber)) {
        errors.push('Phone number format is invalid');
      }
    }
    
    if (data.dateOfBirth !== undefined) {
      if (data.dateOfBirth) {
        const birthDate = new Date(data.dateOfBirth);
        const today = new Date();
        
        if (birthDate > today) {
          errors.push('Date of birth cannot be in the future');
        }
        
        // Check if user is at least 13 years old
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13) {
          errors.push('You must be at least 13 years old');
        }
      }
    }
    
    return errors;
  }

  /**
   * Get user preferences
   */
  getPreferences(profile?: UserProfile) {
    const userProfile = profile || this.currentProfile;
    return userProfile?.preferences || {
      favoriteGenres: [],
      emailNotifications: true,
      smsNotifications: false,
    };
  }

  /**
   * Check if user has email notifications enabled
   */
  hasEmailNotificationsEnabled(profile?: UserProfile): boolean {
    const preferences = this.getPreferences(profile);
    return preferences.emailNotifications;
  }

  /**
   * Check if user has SMS notifications enabled
   */
  hasSmsNotificationsEnabled(profile?: UserProfile): boolean {
    const preferences = this.getPreferences(profile);
    return preferences.smsNotifications;
  }

  /**
   * Get user's favorite genres
   */
  getFavoriteGenres(profile?: UserProfile): string[] {
    const preferences = this.getPreferences(profile);
    return preferences.favoriteGenres || [];
  }

  /**
   * Check if user has favorite genre
   */
  hasFavoriteGenre(genre: string, profile?: UserProfile): boolean {
    const favoriteGenres = this.getFavoriteGenres(profile);
    return favoriteGenres.includes(genre);
  }

  /**
   * Calculate user's age
   */
  calculateAge(profile?: UserProfile): number | null {
    const userProfile = profile || this.currentProfile;
    if (!userProfile?.dateOfBirth) return null;
    
    const birthDate = new Date(userProfile.dateOfBirth);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Format last login date
   */
  formatLastLogin(profile?: UserProfile): string {
    const userProfile = profile || this.currentProfile;
    if (!userProfile?.lastLoginAt) return 'Never';
    
    const lastLogin = new Date(userProfile.lastLoginAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      } else {
        return lastLogin.toLocaleDateString();
      }
    }
  }

  /**
   * Notify profile change listeners
   */
  private notifyProfileChange(profile: UserProfile | null): void {
    this.profileListeners.forEach(callback => {
      try {
        callback(profile);
      } catch (error) {
        this.logger.error('Error in profile change listener:', error);
      }
    });
  }
}
