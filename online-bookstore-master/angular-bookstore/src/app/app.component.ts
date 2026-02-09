import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators';

import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { StateManagementService } from './services/state-management.service';
import { LoggingService } from './services/logging.service';

/**
 * Root component for the Online Bookstore Application
 * 
 * This component serves as the main entry point and container for the entire application.
 * It manages application-level state, navigation tracking, and service initialization.
 * 
 * Injected Services:
 * - AuthService: Manages user authentication state
 * - CartService: Maintains shopping cart data (scoped per user session)
 * - StateManagementService: Centralized application state management
 * - LoggingService: Application-wide logging and monitoring
 * - Router: Angular routing service for navigation
 * 
 * Story: AUTO-165 - Configure Application Services and Dependency Injection Container
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Online Bookstore';
  
  // Observable management
  private destroy$ = new Subject<void>();
  
  // Application state
  isAuthenticated = false;
  cartItemCount = 0;
  currentRoute = '';
  isLoading = false;

  /**
   * Constructor with dependency injection
   * 
   * All services are injected through the configured DI container.
   * Services are resolved based on their registration in AppModule.
   */
  constructor(
    private authService: AuthService,
    private cartService: CartService,
    private stateManagementService: StateManagementService,
    private loggingService: LoggingService,
    private router: Router
  ) {
    this.loggingService.log('AppComponent constructor initialized');
  }

  /**
   * Component initialization lifecycle hook
   * 
   * Sets up subscriptions to services and initializes application state.
   * Demonstrates proper service usage through dependency injection.
   */
  ngOnInit(): void {
    this.loggingService.log('AppComponent ngOnInit started');
    
    // Subscribe to authentication state changes
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isAuth => {
        this.isAuthenticated = isAuth;
        this.loggingService.log(`Authentication state changed: ${isAuth}`);
      });
    
    // Subscribe to cart item count changes (scoped service)
    this.cartService.getCartItemCount()
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.cartItemCount = count;
        this.loggingService.log(`Cart item count updated: ${count}`);
      });
    
    // Subscribe to application loading state
    this.stateManagementService.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });
    
    // Track navigation events for analytics and state management
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        this.currentRoute = event.urlAfterRedirects;
        this.loggingService.log(`Navigation completed: ${this.currentRoute}`);
        this.stateManagementService.updateCurrentRoute(this.currentRoute);
      });
    
    // Initialize application services
    this.initializeApplication();
  }

  /**
   * Initialize application-level services and state
   */
  private initializeApplication(): void {
    this.loggingService.log('Initializing application services...');
    
    // Check for existing authentication token
    this.authService.checkAuthenticationStatus();
    
    // Load cart data if user is authenticated
    if (this.authService.isLoggedIn()) {
      this.cartService.loadCart();
    }
    
    // Initialize state management
    this.stateManagementService.initialize();
    
    this.loggingService.log('Application initialization complete');
  }

  /**
   * Handle user logout
   */
  onLogout(): void {
    this.loggingService.log('User logout initiated');
    this.authService.logout();
    this.cartService.clearCart();
    this.router.navigate(['/login']);
  }

  /**
   * Navigate to cart page
   */
  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }

  /**
   * Component cleanup lifecycle hook
   * 
   * Properly unsubscribes from all observables to prevent memory leaks.
   */
  ngOnDestroy(): void {
    this.loggingService.log('AppComponent destroying - cleaning up subscriptions');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
