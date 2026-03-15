import { Routes } from '@angular/router';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'signin',
    component: SigninComponent,
    title: 'Sign In'
  },
  {
    path: 'signup',
    component: SignupComponent,
    title: 'Sign Up'
  }
];
