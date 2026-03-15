import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { User, LoginRequest, RegisterRequest } from '@employee-payroll/models';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with no user and no token', () => {
    expect(service.isAuthenticated()).toBeFalsy();
    expect(service.getCurrentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('should login successfully with valid credentials', (done) => {
    const credentials: LoginRequest = {
      email: 'demo@example.com',
      password: 'password'
    };

    service.login(credentials).subscribe(response => {
      expect(response.user.email).toBe('demo@example.com');
      expect(response.user.firstName).toBe('Demo');
      expect(response.user.lastName).toBe('User');
      expect(response.token).toContain('mock-jwt-token');
      expect(service.isAuthenticated()).toBeTruthy();
      expect(service.getCurrentUser()?.email).toBe('demo@example.com');
      expect(localStorage.getItem('auth_token')).toBe(response.token);
      done();
    });
  });

  it('should fail login with invalid credentials', (done) => {
    const credentials: LoginRequest = {
      email: 'wrong@example.com',
      password: 'wrongpassword'
    };

    service.login(credentials).subscribe({
      next: () => fail('Should have failed'),
      error: (error) => {
        expect(error.message).toBe('Invalid credentials');
        expect(service.isAuthenticated()).toBeFalsy();
        done();
      }
    });
  });

  it('should register successfully with valid data', (done) => {
    const userData: RegisterRequest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    };

    service.register(userData).subscribe(response => {
      expect(response.user.email).toBe('john@example.com');
      expect(response.user.firstName).toBe('John');
      expect(response.user.lastName).toBe('Doe');
      expect(response.token).toContain('mock-jwt-token');
      expect(service.isAuthenticated()).toBeTruthy();
      expect(service.getCurrentUser()?.firstName).toBe('John');
      done();
    });
  });

  it('should fail registration when passwords do not match', (done) => {
    const userData: RegisterRequest = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'different123'
    };

    service.register(userData).subscribe({
      next: () => fail('Should have failed'),
      error: (error) => {
        expect(error.message).toBe('Passwords do not match');
        expect(service.isAuthenticated()).toBeFalsy();
        done();
      }
    });
  });

  it('should logout and clear stored data', () => {
    // First login
    const credentials: LoginRequest = {
      email: 'demo@example.com',
      password: 'password'
    };

    service.login(credentials).subscribe(() => {
      expect(service.isAuthenticated()).toBeTruthy();
      
      // Then logout
      service.logout();
      
      expect(service.isAuthenticated()).toBeFalsy();
      expect(service.getCurrentUser()).toBeNull();
      expect(service.getToken()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_user')).toBeNull();
    });
  });

  it('should restore user state from localStorage on initialization', () => {
    // Simulate stored auth data
    const mockUser: User = {
      id: '1',
      email: 'stored@example.com',
      firstName: 'Stored',
      lastName: 'User'
    };
    const mockToken = 'stored-token';

    localStorage.setItem('auth_token', mockToken);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));

    // Create new service instance
    const newService = new AuthService();

    expect(newService.isAuthenticated()).toBeTruthy();
    expect(newService.getCurrentUser()?.email).toBe('stored@example.com');
    expect(newService.getToken()).toBe(mockToken);
  });
});
