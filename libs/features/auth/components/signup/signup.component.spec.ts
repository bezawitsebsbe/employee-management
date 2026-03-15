import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { SignupComponent } from './signup.component';
import { AuthService } from '../../../../../core/services/auth.service';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['register', 'isAuthenticated']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.signupForm.get('firstName')?.value).toBe('');
    expect(component.signupForm.get('lastName')?.value).toBe('');
    expect(component.signupForm.get('email')?.value).toBe('');
    expect(component.signupForm.get('password')?.value).toBe('');
    expect(component.signupForm.get('confirmPassword')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const firstNameControl = component.signupForm.get('firstName');
    const lastNameControl = component.signupForm.get('lastName');
    const emailControl = component.signupForm.get('email');
    const passwordControl = component.signupForm.get('password');
    const confirmPasswordControl = component.signupForm.get('confirmPassword');

    firstNameControl?.setValue('');
    lastNameControl?.setValue('');
    emailControl?.setValue('');
    passwordControl?.setValue('');
    confirmPasswordControl?.setValue('');

    expect(firstNameControl?.invalid).toBeTruthy();
    expect(lastNameControl?.invalid).toBeTruthy();
    expect(emailControl?.invalid).toBeTruthy();
    expect(passwordControl?.invalid).toBeTruthy();
    expect(confirmPasswordControl?.invalid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.signupForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.invalid).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.signupForm.get('password');
    
    passwordControl?.setValue('123');
    expect(passwordControl?.invalid).toBeTruthy();

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should validate password match', () => {
    component.signupForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'different123'
    });

    expect(component.signupForm.hasError('passwordMismatch')).toBeTruthy();
  });

  it('should pass when passwords match', () => {
    component.signupForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    expect(component.signupForm.hasError('passwordMismatch')).toBeFalsy();
    expect(component.signupForm.valid).toBeTruthy();
  });

  it('should call authService.register on form submission', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    
    component.signupForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    const mockResponse = {
      user: { id: '1', email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
      token: 'mock-token'
    };
    mockAuthService.register.and.returnValue(of(mockResponse));

    component.onSubmit();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });
  });

  it('should navigate to dashboard on successful registration', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    
    component.signupForm.setValue({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    const mockResponse = {
      user: { id: '1', email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith' },
      token: 'mock-token'
    };
    mockAuthService.register.and.returnValue(of(mockResponse));

    component.onSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error message on failed registration', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    
    component.signupForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    mockAuthService.register.and.returnValue(throwError(() => new Error('Email already exists')));

    component.onSubmit();

    expect(component.errorMessage).toBe('Email already exists');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
