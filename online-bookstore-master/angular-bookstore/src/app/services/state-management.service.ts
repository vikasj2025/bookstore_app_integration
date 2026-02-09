import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { LoggingService } from './logging.service';

export interface ApplicationState {
  currentRoute: string;
  isLoading: boolean;
  notifications: Notification[];
  userPreferences: UserPreferences;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  itemsPerPage: number;
  currency: string;
}

/**
 * State Management Service - Scoped Service
 * 
 * Centralized state management for application-wide state.
 * Maintains consistent state across components and services.
 * 
 * Registered as Scoped service for user session-specific state.
 */
@Injectable({
  providedIn: 'root'
})
export class StateManagementService {
  private readonly initialState: ApplicationState = {
    currentRoute: '/',
    isLoading: false,
    notifications: [],
    userPreferences: {
      theme: 'light',
      itemsPerPage: 12,
      currency: 'USD'
    }
  };

  private stateSubject = new BehaviorSubject<ApplicationState>(this.initialState);
  public state$ = this.stateSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.loadingSubject.asObservable();

  constructor(private loggingService: LoggingService) {
    this.loggingService.log('StateManagementService initialized');
  }

  initialize(): void {
    this.loadUserPreferences();
    this.loggingService.log('State management initialized');
  }

  updateCurrentRoute(route: string): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      currentRoute: route
    });
  }

  setLoading(isLoading: boolean): void {
    this.loadingSubject.next(isLoading);
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      isLoading
    });
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): void {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date()
    };

    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      notifications: [...currentState.notifications, newNotification]
    });

    this.loggingService.log(`Notification added: ${notification.message}`);
  }

  removeNotification(id: string): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      notifications: currentState.notifications.filter(n => n.id !== id)
    });
  }

  updateUserPreferences(preferences: Partial<UserPreferences>): void {
    const currentState = this.stateSubject.value;
    const updatedPreferences = {
      ...currentState.userPreferences,
      ...preferences
    };

    this.stateSubject.next({
      ...currentState,
      userPreferences: updatedPreferences
    });

    this.saveUserPreferences(updatedPreferences);
    this.loggingService.log('User preferences updated');
  }

  private loadUserPreferences(): void {
    const saved = localStorage.getItem('user_preferences');
    if (saved) {
      try {
        const preferences = JSON.parse(saved);
        const currentState = this.stateSubject.value;
        this.stateSubject.next({
          ...currentState,
          userPreferences: preferences
        });
        this.loggingService.log('User preferences loaded from storage');
      } catch (error) {
        this.loggingService.error('Failed to load user preferences', error);
      }
    }
  }

  private saveUserPreferences(preferences: UserPreferences): void {
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
