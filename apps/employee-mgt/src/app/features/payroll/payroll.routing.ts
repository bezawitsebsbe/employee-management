import { Routes } from '@angular/router';
import { PayrollComponent } from './pages/payroll/payroll.component';
import { AddPayrollComponent } from './pages/add-payroll/add-payroll.component';

export const PAYROLL_ROUTES: Routes = [
  {
    path: '',
    component: PayrollComponent,
    title: 'Payroll Management'
  },
  {
    path: 'add',
    component: AddPayrollComponent,
    title: 'Add Payroll Record'
  }
];