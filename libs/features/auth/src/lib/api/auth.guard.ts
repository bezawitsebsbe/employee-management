import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthState } from '../store/state/auth.state';
import { AuthApiService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private store: Store,
    private authApi: AuthApiService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    // First check if token exists in localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      return of(true);
    }
    
    return this.store.select(AuthState.isAuthenticated).pipe(
      take(1),
      map(isAuthenticated => {
        if (isAuthenticated) {
          return true;
        } else {
          // User is not authenticated, redirect to login
          this.router.navigate(['/auth/signin']);
          return false;
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.store.select(AuthState.isAdmin).pipe(
      take(1),
      map(isAdmin => {
        if (isAdmin) {
          return true;
        } else {
          // User is not admin, redirect to dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class ManagerGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.store.select(AuthState.isManager).pipe(
      take(1),
      map(isManager => {
        if (isManager) {
          return true;
        } else {
          // User is not manager, redirect to dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
      })
    );
  }
}

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private store: Store,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.store.select(AuthState.isAuthenticated).pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          return true;
        } else {
          // User is already authenticated, redirect to dashboard
          this.router.navigate(['/dashboard']);
          return false;
        }
      })
    );
  }
}
