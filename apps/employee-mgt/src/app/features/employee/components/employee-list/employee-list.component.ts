import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Employee } from '../../api/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzTagModule, NzIconModule],
  templateUrl: './employee-list.component.html',
})
export class EmployeeListComponent {
  facade = inject(EmployeeSimpleFacade);

  select(emp: Employee) {
    this.facade.selectEmployee(emp);
  }
}
