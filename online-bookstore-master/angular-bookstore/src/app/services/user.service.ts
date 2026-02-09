import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { LoggingService } from './logging.service';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  addresses: Address[];
  createdAt: Date;
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
}

/**
 * User Service - Singleton
 * 
 * Manages user profile and account operations.
 * Uses shared HttpClient instance.
 * 
 * Registered as Singleton for app-wide user management.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private loggingService: LoggingService,
    @Inject('API_BASE_URL') apiBaseUrl: string
  ) {
    this.apiUrl = `${apiBaseUrl}/api/v1/users`;
    this.loggingService.log('UserService initialized');
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`)
      .pipe(
        tap(user => this.loggingService.log(`User profile loaded: ${user.email}`)),
        catchError(this.handleError.bind(this))
      );
  }

  updateUser(updateRequest: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/me`, updateRequest)
      .pipe(
        tap(() => this.loggingService.log('User profile updated')),
        catchError(this.handleError.bind(this))
      );
  }

  addAddress(address: Omit<Address, 'id'>): Observable<Address> {
    return this.http.post<Address>(`${this.apiUrl}/me/addresses`, address)
      .pipe(
        tap(() => this.loggingService.log('Address added')),
        catchError(this.handleError.bind(this))
      );
  }

  updateAddress(addressId: string, address: Partial<Address>): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/me/addresses/${addressId}`, address)
      .pipe(
        tap(() => this.loggingService.log(`Address updated: ${addressId}`)),
        catchError(this.handleError.bind(this))
      );
  }

  deleteAddress(addressId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/me/addresses/${addressId}`)
      .pipe(
        tap(() => this.loggingService.log(`Address deleted: ${addressId}`)),
        catchError(this.handleError.bind(this))
      );
  }

  private handleError(error: any): Observable<never> {
    this.loggingService.error('UserService error:', error);
    return throwError(() => error);
  }
}
