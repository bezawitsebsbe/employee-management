import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Employee } from '../../models/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';
import { Store } from '@ngxs/store';
import { EmployeeState } from '../../store/state/employee.state';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzTagModule, NzIconModule],
  templateUrl: './employee-list.component.html',
})
export class EmployeeListComponent {
  private facade = inject(EmployeeSimpleFacade);
  private store = inject(Store);

  // Public properties for template
  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;

  constructor() {
    // Subscribe to observables and update local properties
    this.facade.employees$.subscribe((employees: Employee[]) => {
      this.employees = employees;
    });
    
    this.facade.selectedEmployee$.subscribe((employee: Employee | null) => {
      this.selectedEmployee = employee;
    });
  }

  select(emp: Employee): void {
    this.facade.loadEmployee(emp.id);
  }
}
