import { Routes } from '@angular/router';
import { AUTH_ROUTES } from '@employee-payroll/features';
import { DashboardComponent } from '@employee-payroll/features';
import { NavbarComponent } from '@employee-payroll/sidebar';
import { navResolver } from '@employee-payroll/sidebar';
import { AuthGuard, NoAuthGuard } from '@employee-payroll/features';

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
      children: [
        {
          path: '',
          loadComponent: () =>
            import('./features/employee/pages/employee-page/employee-page.component')
              .then(m => m.EmployeePageComponent)
        },
        {
          path: 'list',
          loadComponent: () =>
            import('./features/employee/pages/employee-page/employee-page.component')
              .then(m => m.EmployeePageComponent)
        },
        {
          path: 'add',
          loadComponent: () =>
            import('./features/employee/pages/add-employee/add-employee.component')
              .then(m => m.AddEmployeeComponent)
        },
        {
          path: 'detail/:id',
          loadComponent: () =>
            import('./features/employee/pages/employee-detail/employee-detail.component')
              .then(m => m.EmployeeDetailComponent)
        },
        {
          path: 'edit/:id',
          loadComponent: () =>
            import('./features/employee/pages/edit-employee/edit-employee.component')
              .then(m => m.EditEmployeeComponent)
        }
      ]
    },
    {
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
