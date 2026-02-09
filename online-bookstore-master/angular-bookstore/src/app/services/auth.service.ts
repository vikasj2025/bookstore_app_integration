import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { LoggingService } from './logging.service';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Authentication Service - Singleton
 * 
 * Manages user authentication state across the entire application.
 * Handles JWT token management and authentication status.
 * 
 * Registered as Singleton for app-wide shared authentication state.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl: string;
  private readonly TOKEN_KEY = 'bookstore_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'bookstore_refresh_token';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private loggingService: LoggingService,
    @Inject('API_BASE_URL') apiBaseUrl: string
  ) {
    this.apiUrl = `${apiBaseUrl}/api/v1/auth`;
    this.loggingService.log('AuthService initialized');
    this.checkAuthenticationStatus();
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          this.storeTokens(response.token, response.refreshToken);
          this.isAuthenticatedSubject.next(true);
          this.loggingService.log('User logged in successfully');
        }),
        catchError(this.handleError.bind(this))
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.isAuthenticatedSubject.next(false);
    this.loggingService.log('User logged out');
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  checkAuthenticationStatus(): void {
    const isAuth = this.isLoggedIn();
    this.isAuthenticatedSubject.next(isAuth);
    this.loggingService.log(`Authentication status checked: ${isAuth}`);
  }

  refreshAuthToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.storeTokens(response.token, response.refreshToken);
          this.loggingService.log('Auth token refreshed');
        }),
        catchError(this.handleError.bind(this))
      );
  }

  private storeTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private handleError(error: any): Observable<never> {
    this.loggingService.error('AuthService error:', error);
    return throwError(() => error);
  }
}
