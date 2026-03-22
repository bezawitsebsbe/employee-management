import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { SigninComponent } from './signin.component';
import { AuthService } from '../../../../core/services/auth.service';

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: ComponentFixture<SigninComponent>;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'isAuthenticated']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SigninComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with empty fields', () => {
    expect(component.signinForm.get('email')?.value).toBe('');
    expect(component.signinForm.get('password')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const emailControl = component.signinForm.get('email');
    const passwordControl = component.signinForm.get('password');

    emailControl?.setValue('');
    passwordControl?.setValue('');

    expect(emailControl?.invalid).toBeTruthy();
    expect(passwordControl?.invalid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.signinForm.get('email');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.invalid).toBeTruthy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate password minimum length', () => {
    const passwordControl = component.signinForm.get('password');
    
    passwordControl?.setValue('123');
    expect(passwordControl?.invalid).toBeTruthy();

    passwordControl?.setValue('123456');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should call authService.login on form submission', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    
    component.signinForm.setValue({
      email: 'test@example.com',
      password: 'password123'
    });

    const mockResponse = {
      user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' },
      token: 'mock-token'
    };
    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });

  it('should navigate to dashboard on successful login', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    
    component.signinForm.setValue({
      email: 'demo@example.com',
      password: 'password'
    });

    const mockResponse = {
      user: { id: '1', email: 'demo@example.com', firstName: 'Demo', lastName: 'User' },
      token: 'mock-token'
    };
    mockAuthService.login.and.returnValue(of(mockResponse));

    component.onSubmit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error message on failed login', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);
    
    component.signinForm.setValue({
      email: 'wrong@example.com',
      password: 'wrongpassword'
    });

    mockAuthService.login.and.returnValue(throwError(() => new Error('Invalid credentials')));

    component.onSubmit();

    expect(component.errorMessage).toBe('Invalid credentials');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
