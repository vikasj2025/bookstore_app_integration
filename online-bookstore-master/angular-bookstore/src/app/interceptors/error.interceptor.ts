import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { LoggingService } from '../services/logging.service';
import { StateManagementService } from '../services/state-management.service';

/**
 * Error Interceptor
 * 
 * Centralized error handling for all HTTP requests.
 * Logs errors and displays user-friendly notifications.
 * 
 * Registered in AppModule providers with multi: true.
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private loggingService: LoggingService,
    private stateManagementService: StateManagementService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = this.getServerErrorMessage(error);
        }

        this.loggingService.error('HTTP Error:', {
          url: request.url,
          status: error.status,
          message: errorMessage
        });

        // Display user notification
        this.stateManagementService.addNotification({
          type: 'error',
          message: errorMessage
        });

        return throwError(() => error);
      })
    );
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return error.error?.message || 'Bad request';
      case 401:
        return 'Unauthorized. Please log in.';
      case 403:
        return 'Access forbidden';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Internal server error. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return error.error?.message || `Server error: ${error.status}`;
    }
  }
}
