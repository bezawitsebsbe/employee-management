import { Route } from '@angular/router';
import { SigninComponent } from '@employee-payroll/features';

export const appRoutes: Route[] = [
  {
    path: '',
    component: SigninComponent
  },
  {
    path: 'auth',
    loadChildren: () => import('@employee-payroll/features').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('@employee-payroll/features').then(m => m.DashboardModule)
  },
  {
    path: 'payroll',
    loadComponent: () => import('./features/payroll-managment/pages/payroll-management-page/payroll-management-page.component').then(m => m.PayrollManagementPageComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
