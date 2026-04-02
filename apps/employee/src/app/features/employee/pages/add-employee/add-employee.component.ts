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
    
    // Navigate back to employee list after a short delay to allow creation to complete
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/employee']);
    }, 1000); // Wait 1 second for Firestore write to complete
  }

  onFormCancel(): void {
    // Navigate to employee list
    this.router.navigate(['/employee']);
  }
}
