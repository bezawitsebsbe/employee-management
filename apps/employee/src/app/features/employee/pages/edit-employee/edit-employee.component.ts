import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject, takeUntil } from 'rxjs';
import { take } from 'rxjs/operators';
import { filter } from 'rxjs/operators';

import { EmployeeFormComponent } from '../../components/employee-form/employee-form.component';
import { Employee } from '../../models/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';

@Component({
  selector: 'app-edit-employee',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzIconModule,
    NzSpinModule,
    EmployeeFormComponent
  ],
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss']
})
export class EditEmployeeComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private facade = inject(EmployeeSimpleFacade);

  loading = false;
  employeeId: string | null = null;
  employeeData: Employee | null = null;
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.employeeId = params.get('id');
      if (this.employeeId) {
        this.loadEmployee(this.employeeId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEmployee(id: string): void {
    this.facade.loadEmployee(id);
    
    this.facade.selectedEmployee$.pipe(takeUntil(this.destroy$)).subscribe(employee => {
      this.employeeData = employee;
    });
  }

  onFormSubmit(employeeData: any): void {
    if (!this.employeeId) return;

    this.loading = true;
    
    // Update employee
    this.facade.updateEmployee(this.employeeId, employeeData);
    
    // Navigate after a short delay (message will be shown by employee form)
    setTimeout(() => {
      this.loading = false;
      // Navigate to employee detail page
      this.router.navigate(['/employee/detail', this.employeeId]);
    }, 1500);
  }

  onFormCancel(): void {
    console.log('Edit employee cancel clicked, employeeId:', this.employeeId);
    // Navigate to employee detail page
    this.router.navigate(['/employee/detail', this.employeeId]).then(result => {
      console.log('Navigation result:', result);
    });
  }
}
