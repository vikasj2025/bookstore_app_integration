import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Services
import { BookService } from './services/book.service';
import { CartService } from './services/cart.service';
import { OrderService } from './services/order.service';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { StateManagementService } from './services/state-management.service';
import { ConfigService } from './services/config.service';
import { LoggingService } from './services/logging.service';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

// Environment
import { environment } from '../environments/environment';

/**
 * Root module for the Online Bookstore Application
 * 
 * This module configures the dependency injection container with all required services
 * and establishes the foundation for the single-page application architecture.
 * 
 * Service Lifetime Patterns:
 * - Singleton: Services registered at root level (providedIn: 'root') - shared across entire app
 * - Scoped: Services that maintain user-specific state (CartService, StateManagementService)
 * - Transient: Utility services created fresh for each injection
 * 
 * Story: AUTO-165 - Configure Application Services and Dependency Injection Container
 */
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    // Angular Core Modules
    BrowserModule,
    BrowserAnimationsModule,
    
    // HTTP Client Module - Single shared instance to prevent socket exhaustion
    HttpClientModule,
    
    // Form Modules for user interactions
    FormsModule,
    ReactiveFormsModule,
    
    // Application Routing Module
    AppRoutingModule
  ],
  providers: [
    // Configuration Service - Singleton for environment-specific settings
    {
      provide: ConfigService,
      useClass: ConfigService
    },
    
    // API Communication Services - Singleton with shared HttpClient
    {
      provide: BookService,
      useClass: BookService
    },
    {
      provide: OrderService,
      useClass: OrderService
    },
    
    // Authentication Service - Singleton for app-wide auth state
    {
      provide: AuthService,
      useClass: AuthService
    },
    
    // User Service - Singleton for user profile management
    {
      provide: UserService,
      useClass: UserService
    },
    
    // Scoped Services - User-specific data management
    // CartService maintains shopping cart state per user session
    {
      provide: CartService,
      useClass: CartService
    },
    
    // State Management Service - Scoped for user session data
    {
      provide: StateManagementService,
      useClass: StateManagementService
    },
    
    // Utility Services
    {
      provide: LoggingService,
      useClass: LoggingService
    },
    
    // HTTP Interceptors - Order matters: Auth -> Logging -> Error
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoggingInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    
    // Environment-specific API Base URL Configuration
    {
      provide: 'API_BASE_URL',
      useValue: environment.apiBaseUrl
    },
    {
      provide: 'ENVIRONMENT',
      useValue: environment.production ? 'production' : 'development'
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private loggingService: LoggingService) {
    this.loggingService.log('AppModule initialized successfully');
    this.loggingService.log(`Environment: ${environment.production ? 'Production' : 'Development'}`);
    this.loggingService.log(`API Base URL: ${environment.apiBaseUrl}`);
  }
}
