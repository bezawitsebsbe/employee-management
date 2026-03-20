import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  DocumentData,
  QueryDocumentSnapshot 
} from 'firebase/firestore';
import { FirebaseService } from '@employee-payroll/firebase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  token?: string;
  createdAt?: any;
  updatedAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null>;
  private usersCollection = 'users';

  constructor(
    private firebaseService: FirebaseService,
    private router: Router
  ) {
    this.currentUser$ = this.currentUserSubject.asObservable();
    
    // Check for existing session on init (could use token validation here)
    this.checkExistingSession();
  }

  private checkExistingSession(): void {
    const storedUserId = localStorage.getItem('currentUserId');
    if (storedUserId) {
      this.loadUserById(storedUserId).subscribe({
        next: (user) => {
          if (user) {
            this.currentUserSubject.next(user);
          } else {
            localStorage.removeItem('currentUserId');
          }
        },
        error: () => {
          localStorage.removeItem('currentUserId');
        }
      });
    }
  }

  private loadUserById(userId: string): Observable<User | null> {
    return from(
      getDoc(doc(this.firebaseService.database, this.usersCollection, userId))
    ).pipe(
      map(docSnapshot => {
        if (docSnapshot.exists()) {
          return { id: docSnapshot.id, ...docSnapshot.data() } as User;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error loading user:', error);
        return of(null);
      })
    );
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<User> {
    const usersQuery = query(
      collection(this.firebaseService.database, this.usersCollection),
      where('email', '==', email)
    );

    return from(getDocs(usersQuery)).pipe(
      switchMap((querySnapshot) => {
        const userDocs = querySnapshot.docs;
        
        if (userDocs.length === 0) {
          throw new Error('User not found');
        }

        const userDoc = userDocs[0];
        const userData = { id: userDoc.id, ...userDoc.data() } as User;

        // In a real app, you would hash and verify passwords properly
        // For demo purposes, we'll use a simple password check
        if (this.verifyPassword(password, userData)) {
          const userWithToken = {
            ...userData,
            token: 'jwt-token-' + Date.now(),
            updatedAt: new Date()
          };

          // Update last login
          this.updateUserLastLogin(userData.id).subscribe();

          // Store user ID in localStorage for session persistence
          localStorage.setItem('currentUserId', userData.id);
          this.currentUserSubject.next(userWithToken);
          
          return of(userWithToken);
        } else {
          throw new Error('Invalid credentials');
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  private verifyPassword(password: string, user: User): boolean {
    // Mock password verification for demo
    // In production, use proper password hashing (bcrypt, etc.)
    const mockPasswords: { [key: string]: string } = {
      'admin@company.com': 'admin123',
      'user@company.com': 'user123'
    };
    
    return mockPasswords[user.email] === password;
  }

  private updateUserLastLogin(userId: string): Observable<void> {
    return from(
      updateDoc(doc(this.firebaseService.database, this.usersCollection, userId), {
        lastLogin: new Date(),
        updatedAt: new Date()
      })
    );
  }

  signup(name: string, email: string, password: string): Observable<User> {
    // Check if user already exists
    const usersQuery = query(
      collection(this.firebaseService.database, this.usersCollection),
      where('email', '==', email)
    );

    return from(getDocs(usersQuery)).pipe(
      switchMap((querySnapshot) => {
        if (querySnapshot.docs.length > 0) {
          throw new Error('User with this email already exists');
        }

        // Create new user
        const newUser = {
          name,
          email,
          role: 'user' as const,
          passwordHash: this.hashPassword(password), // In production, use proper hashing
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return from(addDoc(collection(this.firebaseService.database, this.usersCollection), newUser));
      }),
      switchMap((docRef) => {
        const createdUser: User = {
          id: docRef.id,
          name,
          email,
          role: 'user',
          token: 'jwt-token-' + Date.now(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Store user ID in localStorage
        localStorage.setItem('currentUserId', createdUser.id);
        this.currentUserSubject.next(createdUser);
        
        return of(createdUser);
      }),
      catchError(error => {
        console.error('Signup error:', error);
        throw error;
      })
    );
  }

  private hashPassword(password: string): string {
    // Mock password hashing for demo
    // In production, use proper hashing libraries like bcrypt
    return 'hashed_' + password;
  }

  logout(): void {
    localStorage.removeItem('currentUserId');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/signin']);
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
