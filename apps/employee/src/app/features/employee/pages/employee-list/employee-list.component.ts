import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';

import { EmployeeTableComponent } from '../../components/employee-table/employee-table.component';
import { Employee } from '../../models/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzIconModule,
    EmployeeTableComponent,
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {
  loading = false;

  private facade = inject(EmployeeSimpleFacade);
  private message = inject(NzMessageService);

  ngOnInit(): void {
    this.loadEmployees();
  }

  private loadEmployees(): void {
    this.loading = true;
    this.facade.loadEmployees();
  }

  get employees$() {
    return this.facade.employees$;
  }

  onViewEmployee(employee: Employee): void {
    console.log('View employee:', employee);
    // Navigation handled by routerLink in table
  }

  onEditEmployee(employee: Employee): void {
    console.log('Edit employee:', employee);
    // Navigation handled by routerLink in table
  }

  onDeleteEmployee(employee: Employee): void {
    if (employee.id) {
      this.facade.deleteEmployee(employee.id);
    }
  }
}
