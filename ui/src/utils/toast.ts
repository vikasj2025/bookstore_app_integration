/**
 * Toast notification utilities
 * Simple implementation - in production, consider using react-hot-toast or similar
 */

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

class ToastManager {
  private container: HTMLElement | null = null;
  private toastCount = 0;

  private ensureContainer(): HTMLElement {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  private createToast(
    message: string,
    type: ToastType,
    options: ToastOptions = {}
  ): void {
    const { duration = 5000 } = options;
    const container = this.ensureContainer();
    
    const toastId = `toast-${++this.toastCount}`;
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = this.getToastClasses(type);
    
    const icon = this.getIcon(type);
    toast.innerHTML = `
      <div class="flex items-center">
        <div class="flex-shrink-0">
          ${icon}
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">${message}</p>
        </div>
        <div class="ml-auto pl-3">
          <button
            type="button"
            class="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2"
            onclick="document.getElementById('${toastId}').remove()"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // Add animation classes
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'transform 0.3s ease-in-out';
    
    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    setTimeout(() => {
      this.removeToast(toastId);
    }, duration);
  }

  private removeToast(toastId: string): void {
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }

  private getToastClasses(type: ToastType): string {
    const baseClasses = 'max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden';
    
    const typeClasses = {
      success: 'border-l-4 border-green-400',
      error: 'border-l-4 border-red-400',
      warning: 'border-l-4 border-yellow-400',
      info: 'border-l-4 border-blue-400',
    };
    
    return `${baseClasses} ${typeClasses[type]} p-4`;
  }

  private getIcon(type: ToastType): string {
    const icons = {
      success: `
        <svg class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      error: `
        <svg class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
      warning: `
        <svg class="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      `,
      info: `
        <svg class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `,
    };
    
    return icons[type];
  }

  success(message: string, options?: ToastOptions): void {
    this.createToast(message, 'success', options);
  }

  error(message: string, options?: ToastOptions): void {
    this.createToast(message, 'error', { duration: 7000, ...options });
  }

  warning(message: string, options?: ToastOptions): void {
    this.createToast(message, 'warning', options);
  }

  info(message: string, options?: ToastOptions): void {
    this.createToast(message, 'info', options);
  }
}

// Create singleton instance
const toastManager = new ToastManager();

// Export toast functions
export const toast = {
  success: (message: string, options?: ToastOptions) => toastManager.success(message, options),
  error: (message: string, options?: ToastOptions) => toastManager.error(message, options),
  warning: (message: string, options?: ToastOptions) => toastManager.warning(message, options),
  info: (message: string, options?: ToastOptions) => toastManager.info(message, options),
};

export default toast;
