import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

import { EmployeeFormComponent } from '../../components/employee-form/employee-form.component';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';

@Component({
  selector: 'app-add-employee',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EmployeeFormComponent
  ],
  templateUrl: './add-employee.component.html',
  styleUrls: ['./add-employee.component.scss']
})
export class AddEmployeeComponent implements OnInit {
  private router = inject(Router);
  private facade = inject(EmployeeSimpleFacade);
  private message = inject(NzMessageService);

  loading = false;

  ngOnInit(): void {
    // Initialize any required data
  }

  onFormSubmit(employeeData: any): void {
    this.loading = true;
    
    // Create employee
    this.facade.createEmployee(employeeData);
    
    // Show success message
    this.message.success('Employee created successfully!');
    
    // Navigate back to employee list
    this.router.navigate(['../list']);
  }

  onFormCancel(): void {
    // Navigate back to employee list
    this.router.navigate(['../list']);
  }
}
