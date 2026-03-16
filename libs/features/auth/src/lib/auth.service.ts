import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null>;

  constructor() {
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    // Check for existing session on init
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    // Mock authentication - in real app, this would call an API
    return new Observable(observer => {
      setTimeout(() => {
        // Mock users for demo
        const mockUsers = [
          {
            id: '1',
            email: 'admin@company.com',
            password: 'admin123',
            name: 'Admin User',
            role: 'admin' as const
          },
          {
            id: '2', 
            email: 'user@company.com',
            password: 'user123',
            name: 'Regular User',
            role: 'user' as const
          }
        ];

        const user = mockUsers.find(u => u.email === email && u.password === password);
        
        if (user) {
          const userWithToken = {
            ...user,
            token: 'mock-jwt-token-' + Date.now()
          };
          
          localStorage.setItem('currentUser', JSON.stringify(userWithToken));
          this.currentUserSubject.next(userWithToken);
          observer.next(userWithToken);
          observer.complete();
        } else {
          observer.error('Invalid credentials');
          observer.complete();
        }
      }, 1000);
    });
  }

  signup(name: string, email: string, password: string): Observable<User> {
    return new Observable(observer => {
      setTimeout(() => {
        // Mock signup - in real app, this would call an API
        const newUser: User = {
          id: Date.now().toString(),
          email,
          name,
          role: 'user',
          token: 'mock-jwt-token-' + Date.now()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        this.currentUserSubject.next(newUser);
        observer.next(newUser);
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }

  isAdmin(): boolean {
    return this.currentUserValue?.role === 'admin';
  }

  isUser(): boolean {
    return this.currentUserValue?.role === 'user';
  }
}
