import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';

import { LoggingService } from './logging.service';

export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  isbn: string;
  category: string;
  description: string;
  imageUrl: string;
  stock: number;
}

/**
 * Book Service - Singleton
 * 
 * Handles all API communication related to book catalog operations.
 * Uses shared HttpClient instance to prevent socket exhaustion.
 * 
 * Registered as Singleton in AppModule for app-wide shared instance.
 */
@Injectable({
  providedIn: 'root'
})
export class BookService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    private loggingService: LoggingService,
    @Inject('API_BASE_URL') apiBaseUrl: string
  ) {
    this.apiUrl = `${apiBaseUrl}/api/v1/books`;
    this.loggingService.log('BookService initialized');
  }

  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.apiUrl)
      .pipe(
        retry(2),
        catchError(this.handleError.bind(this))
      );
  }

  getBookById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  searchBooks(query: string): Observable<Book[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Book[]>(`${this.apiUrl}/search`, { params })
      .pipe(
        catchError(this.handleError.bind(this))
      );
  }

  private handleError(error: any): Observable<never> {
    this.loggingService.error('BookService error:', error);
    return throwError(() => error);
  }
}
