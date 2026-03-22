import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthApiService } from '../api/auth.service';
import { ClearError } from '../store/action/auth.action';
import { AuthState } from '../store/state/auth.state';
import { User, LoginCredentials, AuthResponse } from '../models/auth.model';
import { SignupCredentials } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthFacadeService {
  // Observable properties from store - initialized after constructor
  currentUser$: Observable<User | null>;
  isAuthenticated$: Observable<boolean>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;
  token$: Observable<string | null>;
  userRole$: Observable<string | null>;
  isAdmin$: Observable<boolean>;
  isManager$: Observable<boolean>;

  constructor(
    private store: Store,
    private authApi: AuthApiService
  ) {
    // Initialize observable properties after dependencies are available
    this.currentUser$ = this.store.select(AuthState.currentUser);
    this.isAuthenticated$ = this.store.select(AuthState.isAuthenticated);
    this.loading$ = this.store.select(AuthState.loading);
    this.error$ = this.store.select(AuthState.error);
    this.token$ = this.store.select(AuthState.token);
    this.userRole$ = this.store.select(AuthState.userRole);
    this.isAdmin$ = this.store.select(AuthState.isAdmin);
    this.isManager$ = this.store.select(AuthState.isManager);
  }

  // Login user
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.authApi.login(credentials);
  }

  // Logout user
  logout(): void {
    this.authApi.logout();
  }

  // Signup user
  signup(credentials: SignupCredentials): Observable<AuthResponse> {
    return this.authApi.signup(credentials);
  }

  // Load current user
  loadCurrentUser(): void {
    this.authApi.loadCurrentUser().subscribe();
  }

  // Clear error
  clearError(): void {
    this.store.dispatch(new ClearError());
  }

  // Get current user value synchronously
  get currentUserValue(): User | null {
    return this.store.selectSnapshot(AuthState.currentUser);
  }

  // Get authentication status synchronously
  get isAuthenticatedValue(): boolean {
    return this.store.selectSnapshot(AuthState.isAuthenticated);
  }

  // Get user role synchronously
  get userRoleValue(): string | null {
    return this.store.selectSnapshot(AuthState.userRole);
  }

  // Check if user is admin synchronously
  get isAdminValue(): boolean {
    return this.store.selectSnapshot(AuthState.isAdmin);
  }

  // Check if user is manager synchronously
  get isManagerValue(): boolean {
    return this.store.selectSnapshot(AuthState.isManager);
  }

  // Token management
  setAuthToken(token: string): void {
    this.authApi.setAuthToken(token);
  }

  clearAuthToken(): void {
    this.authApi.clearAuthToken();
  }

  isTokenValid(): boolean {
    return this.authApi.isTokenValid();
  }

  // Initialize auth (load current user if token exists)
  initializeAuth(): void {
    this.loadCurrentUser();
  }

  // Convenience methods for common checks
  isLoggedIn(): boolean {
    return this.isAuthenticatedValue;
  }

  canAccessAdminFeatures(): boolean {
    return this.isAdminValue;
  }

  canAccessManagerFeatures(): boolean {
    return this.isManagerValue;
  }

  // Get user display name
  getUserDisplayName(): string {
    const user = this.currentUserValue;
    return user ? user.name : 'Guest';
  }

  // Get user email
  getUserEmail(): string {
    const user = this.currentUserValue;
    return user ? user.email : '';
  }

  // Get user avatar or initials
  getUserAvatar(): string {
    const user = this.currentUserValue;
    if (!user) return '';
    
    if (user.avatar) {
      return user.avatar;
    }
    
    // Generate initials from name
    return user.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
