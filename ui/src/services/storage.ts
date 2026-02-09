/**
 * Storage Service for the Online Bookstore Application
 * Provides abstracted storage operations with fallback mechanisms
 */

export class StorageService {
  private isLocalStorageAvailable: boolean;
  private isSessionStorageAvailable: boolean;
  private memoryStorage: Map<string, string> = new Map();

  constructor() {
    this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
    this.isSessionStorageAvailable = this.checkSessionStorageAvailability();
  }

  /**
   * Set item in localStorage with fallback to memory storage
   */
  setLocal(key: string, value: string): void {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.setItem(key, value);
      } else {
        this.memoryStorage.set(key, value);
      }
    } catch (error) {
      console.warn('Failed to set localStorage item:', error);
      this.memoryStorage.set(key, value);
    }
  }

  /**
   * Get item from localStorage with fallback to memory storage
   */
  getLocal(key: string): string | null {
    try {
      if (this.isLocalStorageAvailable) {
        return localStorage.getItem(key);
      } else {
        return this.memoryStorage.get(key) || null;
      }
    } catch (error) {
      console.warn('Failed to get localStorage item:', error);
      return this.memoryStorage.get(key) || null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeLocal(key: string): void {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.removeItem(key);
      } else {
        this.memoryStorage.delete(key);
      }
    } catch (error) {
      console.warn('Failed to remove localStorage item:', error);
      this.memoryStorage.delete(key);
    }
  }

  /**
   * Clear all localStorage items
   */
  clearLocal(): void {
    try {
      if (this.isLocalStorageAvailable) {
        localStorage.clear();
      } else {
        this.memoryStorage.clear();
      }
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
      this.memoryStorage.clear();
    }
  }

  /**
   * Set item in sessionStorage
   */
  setSession(key: string, value: string): void {
    try {
      if (this.isSessionStorageAvailable) {
        sessionStorage.setItem(key, value);
      } else {
        this.memoryStorage.set(`session_${key}`, value);
      }
    } catch (error) {
      console.warn('Failed to set sessionStorage item:', error);
      this.memoryStorage.set(`session_${key}`, value);
    }
  }

  /**
   * Get item from sessionStorage
   */
  getSession(key: string): string | null {
    try {
      if (this.isSessionStorageAvailable) {
        return sessionStorage.getItem(key);
      } else {
        return this.memoryStorage.get(`session_${key}`) || null;
      }
    } catch (error) {
      console.warn('Failed to get sessionStorage item:', error);
      return this.memoryStorage.get(`session_${key}`) || null;
    }
  }

  /**
   * Remove item from sessionStorage
   */
  removeSession(key: string): void {
    try {
      if (this.isSessionStorageAvailable) {
        sessionStorage.removeItem(key);
      } else {
        this.memoryStorage.delete(`session_${key}`);
      }
    } catch (error) {
      console.warn('Failed to remove sessionStorage item:', error);
      this.memoryStorage.delete(`session_${key}`);
    }
  }

  /**
   * Set JSON object in localStorage
   */
  setLocalJSON<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.setLocal(key, serialized);
    } catch (error) {
      console.error('Failed to serialize and store JSON:', error);
    }
  }

  /**
   * Get JSON object from localStorage
   */
  getLocalJSON<T>(key: string): T | null {
    try {
      const serialized = this.getLocal(key);
      if (serialized === null) return null;
      return JSON.parse(serialized) as T;
    } catch (error) {
      console.error('Failed to parse JSON from storage:', error);
      return null;
    }
  }

  /**
   * Set JSON object in sessionStorage
   */
  setSessionJSON<T>(key: string, value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.setSession(key, serialized);
    } catch (error) {
      console.error('Failed to serialize and store session JSON:', error);
    }
  }

  /**
   * Get JSON object from sessionStorage
   */
  getSessionJSON<T>(key: string): T | null {
    try {
      const serialized = this.getSession(key);
      if (serialized === null) return null;
      return JSON.parse(serialized) as T;
    } catch (error) {
      console.error('Failed to parse JSON from session storage:', error);
      return null;
    }
  }

  /**
   * Check if localStorage is available
   */
  private checkLocalStorageAvailability(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const test = '__localStorage_test__';
      localStorage.setItem(test, 'test');
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if sessionStorage is available
   */
  private checkSessionStorageAvailability(): boolean {
    try {
      if (typeof window === 'undefined') return false;
      const test = '__sessionStorage_test__';
      sessionStorage.setItem(test, 'test');
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage availability status
   */
  getStorageStatus(): {
    localStorage: boolean;
    sessionStorage: boolean;
  } {
    return {
      localStorage: this.isLocalStorageAvailable,
      sessionStorage: this.isSessionStorageAvailable,
    };
  }

  /**
   * Get all keys from localStorage
   */
  getLocalKeys(): string[] {
    try {
      if (this.isLocalStorageAvailable) {
        return Object.keys(localStorage);
      } else {
        return Array.from(this.memoryStorage.keys()).filter(
          key => !key.startsWith('session_')
        );
      }
    } catch (error) {
      console.warn('Failed to get localStorage keys:', error);
      return [];
    }
  }

  /**
   * Get storage size estimate
   */
  getStorageSize(): { local: number; session: number } {
    let localSize = 0;
    let sessionSize = 0;

    try {
      if (this.isLocalStorageAvailable) {
        for (const key in localStorage) {
          if (localStorage.hasOwnProperty(key)) {
            localSize += localStorage[key].length + key.length;
          }
        }
      }

      if (this.isSessionStorageAvailable) {
        for (const key in sessionStorage) {
          if (sessionStorage.hasOwnProperty(key)) {
            sessionSize += sessionStorage[key].length + key.length;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to calculate storage size:', error);
    }

    return { local: localSize, session: sessionSize };
  }
}
