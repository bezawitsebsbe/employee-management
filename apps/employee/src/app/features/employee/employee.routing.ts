import { Routes } from '@angular/router';
import { EmployeePageComponent } from './pages/employee-page/employee-page.component';
import { EmployeeListComponent } from './pages/employee-list/employee-list.component';
import { EmployeeDetailComponent } from './pages/employee-detail/employee-detail.component';
import { AddEmployeeComponent } from './pages/add-employee/add-employee.component';
import { EditEmployeeComponent } from './pages/edit-employee/edit-employee.component';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    component: EmployeePageComponent,
    title: 'Employee Management'
  },
  {
    path: 'list',
    component: EmployeeListComponent,
    title: 'Employee List'
  },
  {
    path: 'detail/:id',
    component: EmployeeDetailComponent,
    title: 'Employee Details'
  },
  {
    path: 'add',
    component: AddEmployeeComponent,
    title: 'Add Employee'
  },
  {
    path: 'edit/:id',
    component: EditEmployeeComponent,
    title: 'Edit Employee'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];