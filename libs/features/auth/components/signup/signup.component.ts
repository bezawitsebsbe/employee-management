import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AuthService, User } from '../../src/lib/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzIconModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule,
    NzSpinModule
  ],
  template: `
    <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <!-- Header -->
        <div class="text-center">
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Employee Payroll System
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Create your account
          </p>
        </div>

        <!-- Sign Up Form -->
        <nz-card class="shadow-lg">
          <nz-spin [nzSpinning]="loading">
            <form (ngSubmit)="onSubmit()" class="space-y-6">
              <!-- Name -->
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div class="mt-1">
                  <input
                    nz-input
                    id="name"
                    name="name"
                    type="text"
                    autocomplete="name"
                    required
                    [(ngModel)]="credentials.name"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div class="mt-1">
                  <input
                    nz-input
                    id="email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    required
                    [(ngModel)]="credentials.email"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <!-- Password -->
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div class="mt-1">
                  <input
                    nz-input
                    id="password"
                    name="password"
                    type="password"
                    autocomplete="new-password"
                    required
                    [(ngModel)]="credentials.password"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <!-- Error Message -->
              <div *ngIf="errorMessage" class="text-red-600 text-sm">
                {{ errorMessage }}
              </div>

              <!-- Submit Button -->
              <div>
                <button
                  nz-button
                  nzType="primary"
                  type="submit"
                  [nzLoading]="loading"
                  class="w-full bg-orange-500 border-orange-500 hover:bg-orange-600"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </nz-spin>
        </nz-card>

        <!-- Sign In Link -->
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <a routerLink="/auth/signin" class="font-medium text-orange-600 hover:text-orange-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SignupComponent {
  credentials = {
    name: '',
    email: '',
    password: ''
  };
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Signup component initialized');
    // Clear any existing session to ensure fresh signup
    this.authService.logout();
  }

  onSubmit(): void {
    console.log('Signup form submitted:', this.credentials);
    this.loading = true;
    this.errorMessage = '';

    this.authService.signup(this.credentials.name, this.credentials.email, this.credentials.password).subscribe({
      next: (user: User) => {
        console.log('Signup successful:', user);
        console.log('User role:', user.role);
        this.loading = false;
        
        // Redirect based on user role
        if (user.role === 'admin') {
          console.log('Redirecting to admin dashboard');
          // Navigate to main dashboard route
          this.router.navigate(['/dashboard']);
        } else {
          console.log('Redirecting to user dashboard');
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error: any) => {
        console.log('Signup error:', error);
        this.loading = false;
        this.errorMessage = 'Failed to create account';
      }
    });
  }
}
