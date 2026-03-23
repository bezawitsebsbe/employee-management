import { Routes } from '@angular/router';
import { AUTH_ROUTES } from '@employee-payroll/features';
import { EmployeePageComponent } from './features/employee/pages/employee-page/employee-page.component';
import { AttendanceComponent } from './features/employee/pages/attendance/attendance.component';
import { PAYROLL_ROUTES } from './features/payroll/payroll.routing';

export const appRoutes: Routes = [
  {
    path: 'employees',
    component: EmployeePageComponent,
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
    redirectTo: '/employees',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/employees',
  },
];
