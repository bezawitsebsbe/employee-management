import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EMPLOYEE_ROUTES } from './employee.routing';
import { EmployeeComponent } from './pages/employee/employee.component';
import { EmployeeStatisticsCardComponent } from './components/employee-statistics-card/employee-statistics-card.component';
import { EmployeeTableComponent } from './components/employee-table/employee-table.component';

@NgModule({
  declarations: [
    EmployeeComponent,
    EmployeeStatisticsCardComponent,
    EmployeeTableComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(EMPLOYEE_ROUTES)
  ],
  providers: []
})
export class EmployeeModule { }