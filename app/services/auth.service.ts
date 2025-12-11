import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly AUTH_KEY = 'sms_auth_token';
  private readonly USER_KEY = 'sms_user_data';
  
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());
  
  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  constructor() {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  
  private getStoredUser(): User | null {
    if (!this.isBrowser()) return null;
    
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }
  
  private setStoredUser(user: User | null): void {
    if (!this.isBrowser()) return;
    
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.USER_KEY);
    }
  }
  
  getToken(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.AUTH_KEY) : null;
  }
  
  private setToken(token: string): void {
    if (!this.isBrowser()) return;
    localStorage.setItem(this.AUTH_KEY, token);
  }
  
  private clearTokens(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.AUTH_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
  
  private hasValidToken(): boolean {
    const token = this.getToken();
    return !!token;
  }
  
  login(email: string, password: string): Observable<any> {
    return this.http.post<any>('http://localhost:3000/api/auth/login', { email, password }).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
          if (response.user) {
            this.currentUserSubject.next(response.user);
            this.setStoredUser(response.user);
          }
          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError(this.handleError)
    );
  }
  
  logout(): void {
    this.clearTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }
  
  refreshToken(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token available'));
    }
    
    return this.http.post<any>('http://localhost:3000/api/auth/refresh', { token }).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
        }
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }
  
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Authentication failed';
    
    if (error.status === 0) {
      errorMessage = 'Network error';
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials';
    }
    
    return throwError(() => new Error(errorMessage));
  }
  
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
  
  hasRole(requiredRoles: UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }
  
  isAdmin(): boolean {
    return this.hasRole([UserRole.ADMIN]);
  }
  
  updateLastActivity(): void {
    // Track last activity - only in browser
    if (this.isBrowser()) {
      // Implementation for browser
    }
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}