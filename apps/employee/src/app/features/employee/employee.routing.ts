import { Routes } from '@angular/router';
import { EmployeePageComponent } from './pages/employee-page/employee-page.component';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    component: EmployeePageComponent,
    title: 'Employee Management'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];