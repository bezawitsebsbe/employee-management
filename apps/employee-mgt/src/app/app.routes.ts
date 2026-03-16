import { Routes } from '@angular/router';
import { AUTH_ROUTES } from '@employee-payroll/features';
import { DashboardComponent } from '@employee-payroll/features';
import { EmployeePageComponent } from './features/employee/pages/employee-page/employee-page.component';
import { AttendanceComponent } from './features/employee/pages/attendance/attendance.component';
import { PAYROLL_ROUTES } from './features/payroll/payroll.routing';

export const appRoutes: Routes = [
  {
    path: 'auth',
    children: AUTH_ROUTES,
  },
  { path: 'employees', component: EmployeePageComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  {
    path: 'attendance',
    component: AttendanceComponent,
  },
  {
    path: 'payroll',
    children: PAYROLL_ROUTES,
  },
  
  {
    path: '',
    redirectTo: '/auth/signin',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/auth/signin',
  },
];
