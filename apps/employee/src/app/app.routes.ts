import { Routes } from '@angular/router';
import { AUTH_ROUTES } from '@employee-payroll/features';
import { DashboardComponent } from '@employee-payroll/features';
import { EmployeePageComponent } from './features/employee/pages/employee-page/employee-page.component';
import { AttendanceComponent } from './features/attendance/pages/attendance/attendance.component';

import { AuthGuard, NoAuthGuard } from '@employee-payroll/features';

export const appRoutes: Routes = [
  {
    path: 'auth',
    children: AUTH_ROUTES,
    canActivate: [NoAuthGuard]
  },
  { 
    path: 'employees', 
    component: EmployeePageComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'attendance',
    component: AttendanceComponent,
    canActivate: [AuthGuard]
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
