/**
 * Notification Service for the Online Bookstore Application
 * Provides toast notifications and user feedback mechanisms
 */

import toast, { Toast, ToastOptions } from 'react-hot-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface NotificationOptions extends ToastOptions {
  type?: NotificationType;
  autoClose?: boolean;
  closeDelay?: number;
}

export class NotificationService {
  private defaultOptions: NotificationOptions = {
    duration: 4000,
    position: 'top-right',
    autoClose: true,
  };

  /**
   * Show success notification
   */
  success(message: string, options?: NotificationOptions): string {
    return toast.success(message, {
      ...this.defaultOptions,
      ...options,
      icon: '✅',
    });
  }

  /**
   * Show error notification
   */
  error(message: string, options?: NotificationOptions): string {
    return toast.error(message, {
      ...this.defaultOptions,
      duration: 6000, // Longer duration for errors
      ...options,
      icon: '❌',
    });
  }

  /**
   * Show warning notification
   */
  warning(message: string, options?: NotificationOptions): string {
    return toast(message, {
      ...this.defaultOptions,
      ...options,
      icon: '⚠️',
      style: {
        background: '#FEF3C7',
        color: '#92400E',
        border: '1px solid #F59E0B',
      },
    });
  }

  /**
   * Show info notification
   */
  info(message: string, options?: NotificationOptions): string {
    return toast(message, {
      ...this.defaultOptions,
      ...options,
      icon: 'ℹ️',
      style: {
        background: '#DBEAFE',
        color: '#1E40AF',
        border: '1px solid #3B82F6',
      },
    });
  }

  /**
   * Show loading notification
   */
  loading(message: string, options?: NotificationOptions): string {
    return toast.loading(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * Show custom notification
   */
  custom(message: string, options?: NotificationOptions): string {
    return toast(message, {
      ...this.defaultOptions,
      ...options,
    });
  }

  /**
   * Dismiss a specific notification
   */
  dismiss(toastId: string): void {
    toast.dismiss(toastId);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    toast.dismiss();
  }

  /**
   * Show promise-based notification
   */
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: NotificationOptions
  ): Promise<T> {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        ...this.defaultOptions,
        ...options,
      }
    );
  }

  /**
   * Show notification for API errors
   */
  apiError(error: any, fallbackMessage = 'An unexpected error occurred'): string {
    let message = fallbackMessage;

    if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }

    return this.error(message, {
      duration: 6000,
    });
  }

  /**
   * Show validation error notifications
   */
  validationErrors(errors: Array<{ field: string; message: string }>): void {
    errors.forEach((error, index) => {
      setTimeout(() => {
        this.error(`${error.field}: ${error.message}`, {
          duration: 5000,
        });
      }, index * 100); // Stagger the notifications
    });
  }

  /**
   * Show cart-related notifications
   */
  cartNotifications = {
    itemAdded: (bookTitle: string) => 
      this.success(`"${bookTitle}" added to cart`),
    
    itemRemoved: (bookTitle: string) => 
      this.info(`"${bookTitle}" removed from cart`),
    
    itemUpdated: (bookTitle: string, quantity: number) => 
      this.info(`Updated "${bookTitle}" quantity to ${quantity}`),
    
    cartCleared: () => 
      this.info('Cart cleared'),
    
    maxQuantityReached: (maxQuantity: number) => 
      this.warning(`Maximum quantity of ${maxQuantity} reached`),
  };

  /**
   * Show order-related notifications
   */
  orderNotifications = {
    orderPlaced: (orderNumber: string) => 
      this.success(`Order ${orderNumber} placed successfully!`),
    
    orderCancelled: (orderNumber: string) => 
      this.info(`Order ${orderNumber} has been cancelled`),
    
    orderStatusUpdated: (orderNumber: string, status: string) => 
      this.info(`Order ${orderNumber} status updated to ${status}`),
  };

  /**
   * Show authentication-related notifications
   */
  authNotifications = {
    loginSuccess: (userName: string) => 
      this.success(`Welcome back, ${userName}!`),
    
    loginError: () => 
      this.error('Invalid email or password'),
    
    registrationSuccess: () => 
      this.success('Account created successfully! Please log in.'),
    
    logoutSuccess: () => 
      this.info('You have been logged out'),
    
    sessionExpired: () => 
      this.warning('Your session has expired. Please log in again.'),
    
    passwordChanged: () => 
      this.success('Password changed successfully'),
  };

  /**
   * Show network-related notifications
   */
  networkNotifications = {
    offline: () => 
      this.warning('You are currently offline. Some features may not work.'),
    
    online: () => 
      this.success('Connection restored'),
    
    slowConnection: () => 
      this.warning('Slow connection detected. Please be patient.'),
  };

  /**
   * Update an existing notification
   */
  update(toastId: string, message: string, type: NotificationType = 'info'): void {
    const options: NotificationOptions = {
      id: toastId,
    };

    switch (type) {
      case 'success':
        toast.success(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      case 'warning':
        this.warning(message, options);
        break;
      case 'loading':
        toast.loading(message, options);
        break;
      default:
        this.info(message, options);
    }
  }

  /**
   * Get notification configuration
   */
  getConfig(): NotificationOptions {
    return { ...this.defaultOptions };
  }

  /**
   * Update default notification configuration
   */
  updateConfig(options: Partial<NotificationOptions>): void {
    this.defaultOptions = {
      ...this.defaultOptions,
      ...options,
    };
  }
}
