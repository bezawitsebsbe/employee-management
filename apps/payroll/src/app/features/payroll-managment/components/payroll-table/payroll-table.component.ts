import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PayrollFirebaseFacade } from '../../facade/payroll.firebase-facade';
import { PayrollRecord } from '../../api/payroll.firebase-api';

@Component({
  selector: 'app-payroll-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzInputModule,
    NzSelectModule,
    NzTypographyModule,
    NzPopconfirmModule
  ],
  templateUrl: './payroll-table.component.html',
  styleUrls: ['./payroll-table.component.scss']
})
export class PayrollTableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() searchTerm: string = '';
  @Input() selectedDepartment: string = 'all';
  
  @Output() editRecord = new EventEmitter<PayrollRecord>();
  @Output() deleteRecord = new EventEmitter<PayrollRecord>();

  payrollRecords$: Observable<PayrollRecord[]> = new Observable();
  loading$: Observable<boolean> = new Observable();
  
  private destroy$ = new Subject<void>();

  constructor(private readonly payrollFacade: PayrollFirebaseFacade) {}

  ngOnInit(): void {
    this.initializeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeData(): void {
    console.log('PayrollTable: Initializing data');
    
    // Get filtered payroll records from Firebase (with search and department filters applied)
    this.payrollRecords$ = this.payrollFacade.filteredPayrollRecords$;
    this.loading$ = this.payrollFacade.loading$;

    // Debug: Subscribe to see data changes
    const subscription = this.payrollRecords$.subscribe(records => {
      console.log('PayrollTable: Records updated', records);
      console.log('PayrollTable: Records length:', records.length);
    });

    // Clean up subscription on destroy
    this.destroy$.subscribe(() => {
      subscription.unsubscribe();
    });

    // Update search and department filters when they change
    this.payrollFacade.setSearchTerm(this.searchTerm);
    this.payrollFacade.setSelectedDepartment(this.selectedDepartment);
  }

  // Update search and department filters when they change
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] && this.searchTerm !== undefined) {
      this.payrollFacade.setSearchTerm(this.searchTerm);
    }
    if (changes['selectedDepartment'] && this.selectedDepartment !== undefined) {
      this.payrollFacade.setSelectedDepartment(this.selectedDepartment);
    }
  }

  // Update search term method for ngModelChange
  updateSearchTerm(term: string): void {
    this.searchTerm = term;
    this.payrollFacade.setSearchTerm(term);
  }

  // Update department method for ngModelChange
  updateDepartment(department: string): void {
    this.selectedDepartment = department;
    this.payrollFacade.setSelectedDepartment(department);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Processed':
        return 'success';
      case 'Paid':
        return 'default';
      case 'Pending':
        return 'warning';
      default:
        return 'default';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Paid':
        return 'status-paid';
      case 'Processed':
        return 'status-processed';
      case 'Pending':
        return 'status-pending';
      default:
        return '';
    }
  }

  onEditRecord(record: PayrollRecord): void {
    this.editRecord.emit(record);
  }

  onDeleteRecord(record: PayrollRecord): void {
    // Show confirmation dialog before deleting
    if (confirm(`Are you sure you want to delete payroll record for ${record.employeeName}?`)) {
      this.deleteRecord.emit(record);
    }
  }

  // Add output for refresh trigger
  @Output() refresh = new EventEmitter<void>();

  // Manual refresh method
  refreshData(): void {
    console.log('PayrollTable: Manual refresh triggered');
    this.payrollFacade.refreshPayrollRecords();
  }

  // Get total net salary for summary
  getTotalNetSalary(records: PayrollRecord[]): number {
    return records.reduce((sum: number, record: PayrollRecord) => sum + record.netSalary, 0);
  }

  // Format currency
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Format date
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Get department options
  getDepartmentOptions(): string[] {
    return ['all', 'Backend Developer', 'Frontend Developer', 'Marketer', 'Accountant', 'Sales'];
  }

  // Get status options
  getStatusOptions(): string[] {
    return ['all', 'Pending', 'Processed', 'Paid'];
  }
}
