import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser) {
      // User is logged in, allow access
      return true;
    } else {
      // Not logged in, redirect to login
      this.router.navigate(['/auth/signin']);
      return false;
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    const currentUser = this.authService.currentUserValue;
    
    if (currentUser && currentUser.role === 'admin') {
      // User is admin, allow access
      return true;
    } else {
      // Not admin or not logged in, redirect to login or unauthorized
      if (currentUser) {
        this.router.navigate(['/dashboard']); // Regular users go to dashboard
      } else {
        this.router.navigate(['/auth/signin']);
      }
      return false;
    }
  }
}
