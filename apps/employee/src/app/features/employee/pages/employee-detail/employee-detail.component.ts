import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
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
import { take } from 'rxjs/operators';
import { filter } from 'rxjs/operators';

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
  private cdr = inject(ChangeDetectorRef);
  
  employee: Employee | null = null;
  loading = true;
  employeeId: string | null = null;
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: any) => {
      this.employeeId = params.get('id');
      if (this.employeeId) {
        this.loadEmployee(this.employeeId);
      }
    });

    // Continuously subscribe to selectedEmployee for automatic updates
    this.facade.selectedEmployee$.pipe(takeUntil(this.destroy$)).subscribe((employee: Employee | null) => {
      this.employee = employee;
      this.loading = false;
      this.cdr.detectChanges(); // Trigger change detection
    });

    // Listen for route changes to refresh data when coming back from edit
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.employeeId) {
        // Force refresh of employee data
        setTimeout(() => {
          this.loadEmployee(this.employeeId!);
        }, 100);
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
    // Note: Employee data will be updated by the continuous subscription to selectedEmployee$
  }

  onEdit(): void {
    if (this.employeeId) {
      this.router.navigate(['/employee/edit', this.employeeId]);
    }
  }

  onDelete(): void {
    if (this.employee && this.employeeId) {
      // Show confirmation dialog
      if (confirm(`Are you sure you want to delete employee "${this.employee.fullName}"?`)) {
        this.facade.deleteEmployee(this.employeeId);
        this.message.success('Employee deleted successfully');
        
        // Refresh employees list and navigate after a short delay
        setTimeout(() => {
          this.facade.loadEmployees();
          this.router.navigate(['/employee']);
        }, 1000);
      }
    }
  }

  onBack(): void {
    this.router.navigate(['/employee']);
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
