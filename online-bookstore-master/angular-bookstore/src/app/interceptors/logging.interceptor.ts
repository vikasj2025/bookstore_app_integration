import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoggingService } from '../services/logging.service';

/**
 * Logging Interceptor
 * 
 * Logs all HTTP requests and responses for debugging and monitoring.
 * 
 * Registered in AppModule providers with multi: true.
 */
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private loggingService: LoggingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const startTime = Date.now();
    
    this.loggingService.debug(`HTTP Request: ${request.method} ${request.url}`);

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const duration = Date.now() - startTime;
            this.loggingService.debug(
              `HTTP Response: ${request.method} ${request.url} - Status: ${event.status} - Duration: ${duration}ms`
            );
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.loggingService.error(
            `HTTP Error: ${request.method} ${request.url} - Duration: ${duration}ms`,
            error
          );
        }
      })
    );
  }
}
