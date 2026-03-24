import { Component, inject, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Employee } from '../../models/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';



@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzTagModule, NzIconModule],
  templateUrl: './employee-list.component.html',
})
export class EmployeeListComponent implements OnChanges {
  private facade = inject(EmployeeSimpleFacade);
  

  @Input() employees: Employee[] = [];
  selectedEmployee: Employee | null = null;

  constructor() {
    this.facade.selectedEmployee$.subscribe((employee: Employee | null) => {
      this.selectedEmployee = employee;
    });
  }

  ngOnChanges() {
    console.log('📋 EmployeeListComponent received employees:', this.employees.length, this.employees);
  }

  select(emp: Employee): void {
    
    if (emp.id) {
      this.facade.loadEmployee(emp.id);
    }
  }
}
