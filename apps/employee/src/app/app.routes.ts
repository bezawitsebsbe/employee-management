import { Routes } from '@angular/router';
import { AUTH_ROUTES } from '@employee-payroll/features';
import { DashboardComponent } from '@employee-payroll/features';
import { EmployeePageComponent } from './features/employee/pages/employee-page/employee-page.component';
import { ATTENDANCE_ROUTES } from './features/attendance/attendance.routing';

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
    children: ATTENDANCE_ROUTES,
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
