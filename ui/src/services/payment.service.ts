import { apiClient } from './api-client';
import {
  PaymentRequest,
  PaymentResponse,
  PaymentStatusResponse,
  PaymentStatusType,
  ApiResponse,
} from '@/types/api';

export interface PaymentMethod {
  id: string;
  type: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface StripePaymentIntent {
  id: string;
  clientSecret: string;
  status: string;
  amount: number;
  currency: string;
}

export class PaymentService {
  private readonly basePath = '/payments';

  /**
   * Process payment
   */
  async processPayment(paymentData: PaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    return apiClient.post<PaymentResponse>(`${this.basePath}/process`, paymentData);
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<ApiResponse<PaymentStatusResponse>> {
    return apiClient.get<PaymentStatusResponse>(`${this.basePath}/${paymentId}/status`);
  }

  /**
   * Create Stripe Payment Intent (if using Stripe)
   */
  async createPaymentIntent(amount: number, currency: string = 'USD'): Promise<StripePaymentIntent> {
    // This would typically call a backend endpoint that creates a Stripe Payment Intent
    const response = await apiClient.post<StripePaymentIntent>(`${this.basePath}/create-intent`, {
      amount: Math.round(amount * 100), // Convert to cents
      currency,
    });
    
    return response.data;
  }

  /**
   * Confirm Stripe payment
   */
  async confirmStripePayment(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<ApiResponse<PaymentResponse>> {
    return apiClient.post<PaymentResponse>(`${this.basePath}/confirm-stripe`, {
      paymentIntentId,
      paymentMethodId,
    });
  }

  /**
   * Process PayPal payment
   */
  async processPayPalPayment(
    orderId: string,
    amount: number,
    paypalOrderId: string
  ): Promise<ApiResponse<PaymentResponse>> {
    return apiClient.post<PaymentResponse>(`${this.basePath}/paypal`, {
      orderId,
      amount,
      paypalOrderId,
    });
  }

  /**
   * Initiate bank transfer payment
   */
  async initiateBankTransfer(
    orderId: string,
    amount: number,
    bankDetails: {
      accountNumber: string;
      routingNumber: string;
      accountType: 'checking' | 'savings';
    }
  ): Promise<ApiResponse<PaymentResponse>> {
    return apiClient.post<PaymentResponse>(`${this.basePath}/bank-transfer`, {
      orderId,
      amount,
      bankDetails,
    });
  }

  /**
   * Refund payment
   */
  async refundPayment(
    paymentId: string,
    amount?: number,
    reason?: string
  ): Promise<ApiResponse<PaymentResponse>> {
    return apiClient.post<PaymentResponse>(`${this.basePath}/${paymentId}/refund`, {
      amount,
      reason,
    });
  }

  /**
   * Get payment history for user
   */
  async getPaymentHistory(
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<{ content: PaymentResponse[]; totalElements: number; totalPages: number }>> {
    return apiClient.get(`${this.basePath}/history?page=${page}&size=${size}`);
  }

  /**
   * Save payment method
   */
  async savePaymentMethod(paymentMethodData: {
    type: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER';
    stripePaymentMethodId?: string;
    paypalEmail?: string;
    bankDetails?: {
      accountNumber: string;
      routingNumber: string;
      accountType: 'checking' | 'savings';
    };
    isDefault?: boolean;
  }): Promise<ApiResponse<PaymentMethod>> {
    return apiClient.post<PaymentMethod>('/users/payment-methods', paymentMethodData);
  }

  /**
   * Get saved payment methods
   */
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return apiClient.get<PaymentMethod[]>('/users/payment-methods');
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/payment-methods/${paymentMethodId}`);
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<ApiResponse<PaymentMethod>> {
    return apiClient.put<PaymentMethod>(`/users/payment-methods/${paymentMethodId}/default`, {});
  }

  /**
   * Validate payment amount
   */
  validatePaymentAmount(amount: number): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (amount <= 0) {
      errors.push('Payment amount must be greater than zero');
    }
    
    if (amount > 10000) {
      errors.push('Payment amount cannot exceed $10,000');
    }
    
    // Check for reasonable decimal places (max 2)
    if (amount * 100 !== Math.floor(amount * 100)) {
      errors.push('Payment amount cannot have more than 2 decimal places');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate credit card details
   */
  validateCreditCard(cardDetails: {
    number: string;
    expiryMonth: number;
    expiryYear: number;
    cvc: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic card number validation (Luhn algorithm would be better)
    const cardNumber = cardDetails.number.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cardNumber)) {
      errors.push('Invalid card number');
    }
    
    // Expiry validation
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    if (cardDetails.expiryMonth < 1 || cardDetails.expiryMonth > 12) {
      errors.push('Invalid expiry month');
    }
    
    if (cardDetails.expiryYear < currentYear || 
        (cardDetails.expiryYear === currentYear && cardDetails.expiryMonth < currentMonth)) {
      errors.push('Card has expired');
    }
    
    // CVC validation
    if (!/^\d{3,4}$/.test(cardDetails.cvc)) {
      errors.push('Invalid CVC');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get payment status display information
   */
  getPaymentStatusInfo(status: PaymentStatusType): { 
    label: string; 
    color: string; 
    description: string;
    icon: string;
  } {
    const statusMap = {
      PENDING: {
        label: 'Pending',
        color: 'yellow',
        description: 'Payment is being processed',
        icon: 'clock',
      },
      PROCESSING: {
        label: 'Processing',
        color: 'blue',
        description: 'Payment is currently being processed',
        icon: 'loader',
      },
      COMPLETED: {
        label: 'Completed',
        color: 'green',
        description: 'Payment has been completed successfully',
        icon: 'check-circle',
      },
      FAILED: {
        label: 'Failed',
        color: 'red',
        description: 'Payment has failed',
        icon: 'x-circle',
      },
      CANCELLED: {
        label: 'Cancelled',
        color: 'gray',
        description: 'Payment has been cancelled',
        icon: 'x',
      },
      REFUNDED: {
        label: 'Refunded',
        color: 'blue',
        description: 'Payment has been refunded',
        icon: 'arrow-left',
      },
    };
    
    return statusMap[status] || {
      label: 'Unknown',
      color: 'gray',
      description: 'Unknown payment status',
      icon: 'help-circle',
    };
  }

  /**
   * Format payment amount for display
   */
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  /**
   * Get card brand from number
   */
  getCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    
    return 'unknown';
  }

  /**
   * Mask card number for display
   */
  maskCardNumber(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    if (number.length < 4) return number;
    
    const last4 = number.slice(-4);
    const masked = '*'.repeat(number.length - 4);
    
    return `${masked}${last4}`;
  }

  /**
   * Calculate processing fee
   */
  calculateProcessingFee(amount: number, paymentMethod: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER'): number {
    const feeRates = {
      CREDIT_CARD: 0.029, // 2.9%
      PAYPAL: 0.034, // 3.4%
      BANK_TRANSFER: 0.005, // 0.5%
    };
    
    const rate = feeRates[paymentMethod] || 0;
    const fee = amount * rate;
    
    return Math.round(fee * 100) / 100;
  }

  /**
   * Check if payment method supports refunds
   */
  supportsRefunds(paymentMethod: 'CREDIT_CARD' | 'PAYPAL' | 'BANK_TRANSFER'): boolean {
    return paymentMethod === 'CREDIT_CARD' || paymentMethod === 'PAYPAL';
  }
}

// Create singleton instance
export const paymentService = new PaymentService();
export default paymentService;
