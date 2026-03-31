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
    path: 'add',
    component: AddEmployeeComponent,
    title: 'Add Employee'
  },
  {
    path: 'detail/:id',
    component: EmployeeDetailComponent,
    title: 'Employee Details'
  },
  {
    path: 'edit/:id',
    component: EditEmployeeComponent,
    title: 'Edit Employee'
  }
];