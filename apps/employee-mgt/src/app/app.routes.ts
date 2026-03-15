import { Routes } from '@angular/router';
import { AUTH_ROUTES } from '@employee-payroll/features';
import { DashboardComponent } from '@employee-payroll/features';
import { EmployeePageComponent } from './features/employee/pages/employee-page/employee-page.component';
import { AttendanceComponent } from './features/employee/pages/attendance/attendance.component';
import { PayrollComponent } from './features/payroll/pages/payroll/payroll.component';

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
    component: PayrollComponent,
  },
  // {
  //   path: 'leave',
  //   loadComponent: () => import('./features/employee/pages/leave/leave.component').then(m => m.LeaveComponent)
  // },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
