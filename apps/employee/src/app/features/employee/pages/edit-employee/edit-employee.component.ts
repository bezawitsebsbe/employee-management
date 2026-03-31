import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject, takeUntil } from 'rxjs';

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
  private message = inject(NzMessageService);

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
    
    // Show success message
    this.message.success('Employee updated successfully!');
    
    // Navigate back to employee detail
    setTimeout(() => {
      this.router.navigate(['../detail', this.employeeId], { relativeTo: this.route });
    }, 1000);
  }

  onFormCancel(): void {
    // Navigate back to employee detail
    if (this.employeeId) {
      this.router.navigate(['../detail', this.employeeId], { relativeTo: this.route });
    } else {
      this.router.navigate(['../list'], { relativeTo: this.route });
    }
  }
}
