import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { LoggingService } from './logging.service';
import { Book } from './book.service';

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

/**
 * Cart Service - Scoped Service
 * 
 * Maintains user-specific shopping cart state.
 * Registered as Scoped service to ensure separate instances per user session.
 * 
 * This service manages cart data in memory and synchronizes with backend API.
 */
@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly apiUrl: string;
  private cartSubject = new BehaviorSubject<Cart>({
    items: [],
    totalAmount: 0,
    totalItems: 0
  });

  public cart$ = this.cartSubject.asObservable();

  constructor(
    private http: HttpClient,
    private loggingService: LoggingService,
    @Inject('API_BASE_URL') apiBaseUrl: string
  ) {
    this.apiUrl = `${apiBaseUrl}/api/v1/cart`;
    this.loggingService.log('CartService initialized');
  }

  loadCart(): void {
    this.http.get<Cart>(this.apiUrl)
      .pipe(
        tap(cart => this.loggingService.log('Cart loaded from API')),
        catchError(this.handleError.bind(this))
      )
      .subscribe(cart => this.cartSubject.next(cart));
  }

  addToCart(book: Book, quantity: number = 1): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, { bookId: book.id, quantity })
      .pipe(
        tap(cart => {
          this.cartSubject.next(cart);
          this.loggingService.log(`Added ${quantity} of ${book.title} to cart`);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  removeFromCart(bookId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${bookId}`)
      .pipe(
        tap(cart => {
          this.cartSubject.next(cart);
          this.loggingService.log(`Removed book ${bookId} from cart`);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  updateQuantity(bookId: string, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${bookId}`, { quantity })
      .pipe(
        tap(cart => this.cartSubject.next(cart)),
        catchError(this.handleError.bind(this))
      );
  }

  clearCart(): void {
    this.http.delete<void>(this.apiUrl)
      .pipe(
        tap(() => this.loggingService.log('Cart cleared')),
        catchError(this.handleError.bind(this))
      )
      .subscribe(() => {
        this.cartSubject.next({
          items: [],
          totalAmount: 0,
          totalItems: 0
        });
      });
  }

  getCartItemCount(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart.totalItems)
    );
  }

  private handleError(error: any): Observable<never> {
    this.loggingService.error('CartService error:', error);
    return throwError(() => error);
  }
}

function map(arg0: (cart: Cart) => number): import("rxjs").OperatorFunction<Cart, number> {
  throw new Error('Function not implemented.');
}
