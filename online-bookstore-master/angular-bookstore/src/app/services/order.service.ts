import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { LoggingService } from './logging.service';
import { Cart } from './cart.service';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  bookId: string;
  title: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderRequest {
  cart: Cart;
  shippingAddress: Address;
  paymentMethod: string;
}

/**
 * Order Service - Singleton
 * 
 * Handles all order-related API operations.
 * Uses shared HttpClient instance.
 * 
 * Registered as Singleton in AppModule.
 */
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private loggingService: LoggingService,
    @Inject('API_BASE_URL') apiBaseUrl: string
  ) {
    this.apiUrl = `${apiBaseUrl}/api/v1/orders`;
    this.loggingService.log('OrderService initialized');
  }

  createOrder(orderRequest: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderRequest)
      .pipe(
        tap(order => this.loggingService.log(`Order created: ${order.id}`)),
        catchError(this.handleError.bind(this))
      );
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/user`)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  cancelOrder(orderId: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/cancel`, {})
      .pipe(
        tap(() => this.loggingService.log(`Order cancelled: ${orderId}`)),
        catchError(this.handleError.bind(this))
      );
  }

  private handleError(error: any): Observable<never> {
    this.loggingService.error('OrderService error:', error);
    return throwError(() => error);
  }
}
