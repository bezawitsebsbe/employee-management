import { Routes } from '@angular/router';
import { AUTH_ROUTES } from '@employee-payroll/features';
import { DashboardComponent } from '@employee-payroll/features';
import { NavbarComponent } from '@employee-payroll/sidebar';
import { navResolver } from '@employee-payroll/sidebar';
import { AuthGuard, NoAuthGuard } from '@employee-payroll/features';
import { EMPLOYEE_ROUTES } from './features/employee/employee.routing';
import { ATTENDANCE_ROUTES } from './features/attendance/attendance.routing';


export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full',
  },
  {
    path: 'auth',
    children: AUTH_ROUTES,
    canActivate: [NoAuthGuard],
  },
  {
  path: '',
  component: NavbarComponent,
  resolve: { navItems: navResolver },
  data: { app: 'employee' },
  canActivate: [AuthGuard],          // protects the parent itself
  canActivateChild: [AuthGuard],     // protects ALL children automatically
  children: [
    {
      path: 'dashboard',
      component: DashboardComponent
    },
    {
  path: 'employee',
  loadChildren: () =>
    import('./features/employee/employee.routing')
      .then(m => m.EMPLOYEE_ROUTES)
},
   {
  path: 'attendance',
  loadChildren: () =>
    import('./features/attendance/attendance.routing')
      .then(m => m.ATTENDANCE_ROUTES)
}, {
      path: 'attendance',
      loadComponent: () =>
        import(
          './features/attendance/pages/attendance/attendance.component'
        ).then((m) => m.AttendanceComponent),
    },
  ],
},
  {
    path: '**',
    redirectTo: '/auth',
  },
];
