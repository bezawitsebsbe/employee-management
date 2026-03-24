import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, of, from } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where,
  Timestamp,
  setDoc,
  addDoc
} from 'firebase/firestore';
import { FirebaseService } from '@employee-payroll/firebase';

import { 
  Login, 
  LoginSuccess, 
  LoginFailure, 
  Logout, 
  LogoutSuccess, 
  LoadCurrentUser, 
  LoadCurrentUserSuccess, 
  LoadCurrentUserFailure, 
  ClearError, 
  SetToken 
} from '../store/action/auth.action';
import { User, LoginCredentials, AuthResponse, SignupCredentials } from '../models/auth.model';

// Interface for Firestore user data (includes password for authentication)
interface FirestoreUserData {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  avatar?: string;
  createdAt?: Timestamp;
  lastLogin?: Timestamp;
  password?: string; // Only for authentication, not returned to client
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private usersCollection = 'users';

  constructor(
    private firebaseService: FirebaseService,
    private router: Router,
    private store: Store
  ) {}

  // Get user by email from Firestore (including password for validation)
  getUserByEmailDataWithPassword(email: string): Observable<FirestoreUserData | null> {
    return from(getDocs(query(collection(this.firebaseService.database, this.usersCollection), where('email', '==', email)))).pipe(
      map(querySnapshot => {
        if (querySnapshot.empty) {
          return null;
        }
        const doc = querySnapshot.docs[0];
        return doc.data() as FirestoreUserData;
      }),
      catchError(error => {
        console.error('Error fetching user by email:', error);
        return of(null);
      })
    );
  }

  // Get user by ID from Firestore
  getUserByIdData(userId: string): Observable<User | null> {
    return from(getDoc(doc(this.firebaseService.database, this.usersCollection, userId))).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as FirestoreUserData;
          return {
            id: docSnapshot.id,
            name: data.name || '',
            email: data.email || '',
            role: data.role || 'user',
            isActive: data.isActive ?? true,
            avatar: data.avatar,
            createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
            lastLogin: data.lastLogin ? (data.lastLogin as Timestamp).toDate() : undefined
          } as User;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching user:', error);
        return of(null);
      })
    );
  }

  // Login user
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.store.dispatch(new Login(credentials));
    
    return this.getUserByEmailDataWithPassword(credentials.email).pipe(
      switchMap(firestoreUser => {
        if (!firestoreUser) {
          this.store.dispatch(new LoginFailure({ error: 'User not found' }));
          throw new Error('User not found');
        }

        // Validate password
        if (firestoreUser.password !== credentials.password) {
          this.store.dispatch(new LoginFailure({ error: 'Invalid credentials' }));
          throw new Error('Invalid credentials');
        }

        // Create User object without password
        const user: User = {
          id: Date.now().toString(), // Will be updated with actual doc ID
          name: firestoreUser.name || '',
          email: firestoreUser.email || '',
          role: (firestoreUser.role as 'admin' | 'user' | 'manager') || 'user',
          isActive: firestoreUser.isActive ?? true,
          avatar: firestoreUser.avatar,
          createdAt: firestoreUser.createdAt ? firestoreUser.createdAt.toDate() : new Date(),
          lastLogin: firestoreUser.lastLogin ? firestoreUser.lastLogin.toDate() : undefined
        };

        // Generate mock token
        const token = this.generateToken(user);
        
        const response: AuthResponse = {
          user,
          token,
          message: 'Login successful'
        };

        this.store.dispatch(new LoginSuccess(response));
        return of(response);
      }),
      catchError(error => {
        this.store.dispatch(new LoginFailure({ error: error.message }));
        throw error;
      })
    );
  }

  // Signup user
  signup(credentials: SignupCredentials): Observable<AuthResponse> {
    this.store.dispatch(new LoadCurrentUser());
    
    return this.getUserByEmailDataWithPassword(credentials.email).pipe(
      switchMap(firestoreUser => {
        if (firestoreUser) {
          this.store.dispatch(new LoginFailure({ error: 'User already exists' }));
          throw new Error('User already exists');
        }

        // Create new user and save to Firebase with password
        const newUser: User = {
          id: Date.now().toString(),
          name: credentials.name,
          email: credentials.email,
          role: 'user' as const,
          isActive: true,
          createdAt: new Date()
        };

        // Create Firestore user data with password
        const newFirestoreUser: FirestoreUserData = {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: Timestamp.fromDate(newUser.createdAt),
          password: credentials.password // Store password for authentication
        };

        // Save to Firebase first
        return from(addDoc(collection(this.firebaseService.database, this.usersCollection), newFirestoreUser)).pipe(
          switchMap(() => {
            // Generate mock token after successful save
            const token = this.generateToken(newUser);
            
            const response: AuthResponse = {
              user: newUser,
              token,
              message: 'Signup successful'
            };

            this.store.dispatch(new LoginSuccess(response));
            return of(response);
          }),
          catchError(error => {
            this.store.dispatch(new LoginFailure({ error: error.message }));
            throw error;
          })
        );
      }),
      catchError(error => {
        this.store.dispatch(new LoginFailure({ error: error.message }));
        throw error;
      })
    );
  }

  // Logout user
  logout(): void {
    this.store.dispatch(new Logout());
    
    // Clear token from localStorage
    localStorage.removeItem('authToken');
    
    // Dispatch logout success
    this.store.dispatch(new LogoutSuccess());
  }

  // Load current user
  loadCurrentUser(): Observable<User | null> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      this.store.dispatch(new LoadCurrentUserFailure({ error: 'No token found' }));
      return of(null);
    }

    // Mock token validation - in real app, validate with backend
    const mockUserId = this.getUserIdFromToken(token);
    
    this.store.dispatch(new LoadCurrentUser());
    
    if (mockUserId) {
      return this.getUserByIdData(mockUserId).pipe(
        map(user => {
          if (user) {
            this.store.dispatch(new LoadCurrentUserSuccess({ user }));
            return user;
          } else {
            this.store.dispatch(new LoadCurrentUserFailure({ error: 'User not found' }));
            return null;
          }
        }),
        catchError(error => {
          this.store.dispatch(new LoadCurrentUserFailure({ error: error.message }));
          return of(null);
        })
      );
    } else {
      this.store.dispatch(new LoadCurrentUserFailure({ error: 'Invalid token' }));
      return of(null);
    }
  }

  // Generate mock JWT token
  private generateToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    return btoa(JSON.stringify(payload));
  }

  // Get user ID from token
  private getUserIdFromToken(token: string): string | null {
    try {
      const payload = JSON.parse(atob(token));
      return payload.userId;
    } catch {
      return null;
    }
  }

  // Token management
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.store.dispatch(new SetToken({ token }));
  }

  clearAuthToken(): void {
    localStorage.removeItem('authToken');
  }

  isTokenValid(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token));
      return payload.exp > Date.now();
    } catch {
      return false;
    }
  }
}
