import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Subject, takeUntil } from 'rxjs';

import { Employee } from '../../models/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzIconModule,
    NzCardModule,
    NzTagModule,
    NzDescriptionsModule,
    NzAvatarModule,
    NzSpinModule
  ],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private facade = inject(EmployeeSimpleFacade);
  private message = inject(NzMessageService);
  
  employee: Employee | null = null;
  loading = true;
  employeeId: string | null = null;
  
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
    this.loading = true;
    this.facade.loadEmployee(id);
    
    this.facade.selectedEmployee$.pipe(takeUntil(this.destroy$)).subscribe(employee => {
      this.employee = employee;
      this.loading = false;
    });
  }

  onEdit(): void {
    if (this.employeeId) {
      this.router.navigate(['../edit', this.employeeId], { relativeTo: this.route });
    }
  }

  onDelete(): void {
    if (this.employee && this.employeeId) {
      this.facade.deleteEmployee(this.employeeId);
      this.message.success('Employee deleted successfully');
      this.router.navigate(['../list'], { relativeTo: this.route });
    }
  }

  onBack(): void {
    this.router.navigate(['../list'], { relativeTo: this.route });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Active':
        return 'green';
      case 'Inactive':
        return 'red';
      case 'On Leave':
        return 'orange';
      default:
        return 'default';
    }
  }

  getDepartmentColor(department: string): string {
    switch (department) {
      case 'Sales':
        return 'blue';
      case 'Marketing':
        return 'green';
      case 'HR':
        return 'red';
      case 'Finance':
        return 'cyan';
      case 'IT':
        return 'purple';
      default:
        return 'default';
    }
  }

  getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Helper method to format date
  formatDate(date: any): string {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  }
}
