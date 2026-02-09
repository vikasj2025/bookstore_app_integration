import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { LoggingService } from '../services/logging.service';

/**
 * Authentication Interceptor
 * 
 * Automatically attaches JWT tokens to outgoing HTTP requests.
 * Handles token refresh on 401 responses.
 * 
 * Registered in AppModule providers with multi: true.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private loggingService: LoggingService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip token attachment for auth endpoints
    if (request.url.includes('/auth/login') || request.url.includes('/auth/register')) {
      return next.handle(request);
    }

    const token = this.authService.getToken();
    
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !request.url.includes('/auth/refresh')) {
          // Token expired, attempt refresh
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loggingService.log('Token expired, attempting refresh');
    
    return this.authService.refreshAuthToken().pipe(
      switchMap(response => {
        this.loggingService.log('Token refreshed successfully');
        return next.handle(this.addToken(request, response.token));
      }),
      catchError(error => {
        this.loggingService.error('Token refresh failed', error);
        this.authService.logout();
        return throwError(() => error);
      })
    );
  }
}
