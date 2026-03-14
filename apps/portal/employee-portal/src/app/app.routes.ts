import { Route } from '@angular/router';
import { PAYROLL_ROUTES } from './features/payroll/payroll.routing';
import { EMPLOYEE_ROUTES } from './features/employee/employee.routing';

export const appRoutes: Route[] = [
  {
    path: 'payroll',
    children: PAYROLL_ROUTES
  },
  {
    path: 'employee',
    children: EMPLOYEE_ROUTES
  },
  { path: '', redirectTo: '/payroll', pathMatch: 'full' },
  { path: '**', redirectTo: '/payroll' }
];
