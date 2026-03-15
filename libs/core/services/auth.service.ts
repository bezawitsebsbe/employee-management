import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public token$ = this.tokenSubject.asObservable();
  
  constructor() {
    // Check for stored auth data on initialization
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (storedToken && storedUser) {
      this.tokenSubject.next(storedToken);
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Simulate API call - replace with actual HTTP request
    if (credentials.email === 'admin@powerhrm.com' && credentials.password === 'password') {
      const mockResponse: AuthResponse = {
        user: {
          id: '1',
          email: credentials.email,
          firstName: 'Demo',
          lastName: 'User',
          role: 'employee'
        },
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token'
      };
      
      return of(mockResponse).pipe(
        delay(1000),
        tap(response => this.handleAuthResponse(response))
      );
    }
    
    return throwError(() => new Error('Invalid credentials'));
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    // Validate passwords match
    if (userData.password !== userData.confirmPassword) {
      return throwError(() => new Error('Passwords do not match'));
    }
    
    // Simulate API call - replace with actual HTTP request
    const mockResponse: AuthResponse = {
      user: {
        id: Date.now().toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'employee'
      },
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token'
    };
    
    return of(mockResponse).pipe(
      delay(1000),
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('refresh_token');
    
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    
    if (response.refreshToken) {
      localStorage.setItem('refresh_token', response.refreshToken);
    }
    
    this.tokenSubject.next(response.token);
    this.currentUserSubject.next(response.user);
  }
}
