import { Component, OnInit, OnDestroy, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AddPayrollRecordModalComponent } from '../../components/add-payroll-record-modal/add-payroll-record-modal.component';
import { PayrollData, PayrollFormData, PayrollRecord } from '../../models/payroll.models';
import { PayrollFacadeService } from '../../facades/payroll.facade.service';
import { SidebarComponent } from '@employee-payroll/sidebar';
import { DashboardService } from '@employee-payroll/features';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddPayrollRecordModalComponent,
    SidebarComponent,
  ],
  templateUrl: './payroll.component.html',
  styleUrls: ['./payroll.component.scss'], // Fix: styleUrl to styleUrls
})
export class PayrollComponent implements OnInit, OnDestroy {
  sidebarItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Employee', icon: '👥', path: '/employees' },
    { label: 'Payroll', icon: '💰', path: '/payroll' },
    { label: 'Attendance', icon: '🕒', path: '/attendance' },
  ];
  showAddModal = false;
  showEditModal = false;
  payrollData$!: Signal<PayrollData>;
  records$!: Signal<PayrollRecord[]>;
  loading$!: Signal<boolean>;
  error$!: Signal<string | null>;
  searchTerm = '';
  selectedDepartment = '';
  filteredRecords: PayrollRecord[] = [];
  editingRecord: PayrollRecord | null = null;
  editingIndex: number = -1;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly payrollFacade: PayrollFacadeService,
    private readonly router: Router,
    private readonly dashboardService: DashboardService,
  ) {}

  ngOnInit(): void {
    this.payrollData$ = this.payrollFacade.payrollData$;
    this.records$ = this.payrollFacade.records$;
    this.loading$ = this.payrollFacade.loading$;
    this.error$ = this.payrollFacade.error$;
    this.payrollFacade.loadPayrollData();

    // Initialize filtered records
    this.updateFilteredRecords();
  }

  // Method to update filtered records
  updateFilteredRecords(): void {
    const records = this.records$(); // Use () to get computed signal value
    const search = this.searchTerm.toLowerCase().trim();
    const department = this.selectedDepartment.toLowerCase().trim();

    console.log('Updating filtered records...');
    console.log('Available records:', records);
    console.log('Search term:', search);
    console.log('Selected department:', department);

    if (!search && !department) {
      console.log('No filters, returning all records');
      this.filteredRecords = records;
      return;
    }

    const filtered = records.filter((record: PayrollRecord) => {
      // Add type annotation
      const departmentText = record.department.toLowerCase();
      console.log('Checking record:', record.department);

      // Extract employee ID from the department field (e.g., "001 Sales" -> "001")
      const employeeIdMatch = departmentText.match(/^(\d+)/);
      const employeeId = employeeIdMatch ? employeeIdMatch[1] : '';
      const departmentName = departmentText.replace(/^\d+\s*/, '').trim();
      console.log('Extracted employee ID:', employeeId);
      console.log('Extracted department name:', departmentName);

      // Exact match for employee ID OR partial match for department name
      const exactIdMatch = employeeId === search;
      const searchDepartmentMatch =
        departmentText.includes(search) && !/^\d+$/.test(search);
      const departmentFilterMatch =
        !department ||
        departmentName === department ||
        department === 'all departments';

      console.log(
        'Exact ID match:',
        exactIdMatch,
        'Search department match:',
        searchDepartmentMatch,
        'Department filter match:',
        departmentFilterMatch,
      );

      // Apply both search and department filters
      const matchesSearch = !search || exactIdMatch || searchDepartmentMatch;
      const matchesDepartment = !department || departmentFilterMatch;

      return matchesSearch && matchesDepartment;
    });

    console.log('Filtered result:', filtered);
    this.filteredRecords = filtered;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onExport(): void {
    this.payrollFacade
      .exportPayrollData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (csvData) => {
          this.downloadCSV(csvData);
        },
        error: (error) => {
          console.error('Export failed:', error);
        },
      });
  }

  onAddPayroll(): void {
    this.router.navigate(['/payroll/add']);
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.updateFilteredRecords();
  }

  onDepartmentChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedDepartment = target.value;
    this.updateFilteredRecords();
  }

  onEditRecord(index: number): void {
    alert(`Edit button clicked for record at index: ${index}`);
    console.log('Edit button clicked for index:', index);
    const record = this.filteredRecords[index];
    console.log('Record to edit:', record);
    
    // Always search in the full records array, not filtered
    const actualRecords = this.records$();
    console.log('All records:', actualRecords);
    const actualIndex = actualRecords.findIndex((r) => 
      r.department === record.department && 
      r.baseSalary === record.baseSalary &&
      r.netSalary === record.netSalary
    );
    console.log('Actual index in full array:', actualIndex);

    if (actualIndex !== -1) {
      this.editingRecord = { ...record }; // Create a copy
      this.editingIndex = actualIndex;
      this.showEditModal = true;
      console.log('Edit modal should open with record:', this.editingRecord);
      console.log('showEditModal is now:', this.showEditModal);
    } else {
      console.error('Could not find record in full array');
      alert('Error: Could not find record to edit');
    }
  }

  onDeleteRecord(index: number): void {
    if (confirm('Are you sure you want to delete this payroll record?')) {
      const recordToDelete = this.filteredRecords[index];
      const actualRecords = this.records$();
      
      // Find the record in the actual array using multiple properties for reliable matching
      const actualIndex = actualRecords.findIndex((record) => 
        record.department === recordToDelete.department && 
        record.baseSalary === recordToDelete.baseSalary &&
        record.netSalary === recordToDelete.netSalary &&
        record.status === recordToDelete.status
      );

      console.log('Delete attempt - Filtered index:', index);
      console.log('Record to delete:', recordToDelete);
      console.log('Found actual index:', actualIndex);
      console.log('Total records:', actualRecords.length);

      if (actualIndex !== -1) {
        this.payrollFacade
          .deletePayrollRecord(actualIndex)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              console.log('Record deleted successfully');
              
              // Track activity in dashboard
              try {
                this.dashboardService.trackPayrollUpdated(-1);
              } catch (error) {
                console.warn('Failed to track payroll activity:', error);
              }
              
              // Update filtered records after deletion
              setTimeout(() => this.updateFilteredRecords(), 100);
            },
            error: (error) => {
              console.error('Failed to delete record:', error);
              alert('Failed to delete record. Please try again.');
            },
          });
      } else {
        console.error('Could not find record to delete');
        alert('Error: Could not find record to delete');
      }
    }
  }

  onCloseModal(): void {
    this.showAddModal = false;
  }

  onCloseEditModal(): void {
    this.showEditModal = false;
    this.editingRecord = null;
    this.editingIndex = -1;
  }

  onUpdatePayroll(updatedRecord: PayrollRecord): void {
    console.log('Update button clicked');
    console.log('Editing index:', this.editingIndex);
    console.log('Updated record:', updatedRecord);

    if (this.editingIndex !== -1 && updatedRecord) {
      console.log('Calling facade updatePayrollRecord...');
      this.payrollFacade
        .updatePayrollRecord(this.editingIndex, updatedRecord)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            console.log('Update successful:', result);
            this.showEditModal = false;
            this.editingRecord = null;
            this.editingIndex = -1;
            
            // Track activity in dashboard
            try {
              this.dashboardService.trackPayrollUpdated(0);
            } catch (error) {
              console.warn('Failed to track payroll activity:', error);
            }
            
            // Update filtered records after update
            setTimeout(() => this.updateFilteredRecords(), 100);
          },
          error: (error) => {
            console.error('Failed to update record:', error);
            alert('Failed to update record. Please try again.');
          },
        });
    } else {
      console.error(
        'Invalid editing index or record:',
        this.editingIndex,
        updatedRecord,
      );
    }
  }

  onSavePayroll(formData: PayrollFormData): void {
    this.payrollFacade
      .addPayrollRecord(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showAddModal = false;
          // Track activity in dashboard
          try {
            this.dashboardService.trackPayrollUpdated(1);
          } catch (error) {
            console.warn('Failed to track payroll activity:', error);
          }
          // Update filtered records after addition
          setTimeout(() => this.updateFilteredRecords(), 100);
        },
        error: (error) => {
          console.error('Failed to add record:', error);
          alert('Failed to add record. Please try again.');
        },
      });
  }

  private downloadCSV(csvData: string): void {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Calculate total payroll from localStorage (same as dashboard)
  calculateTotalPayroll(): string {
    try {
      const storedPayroll = localStorage.getItem('payroll');
      if (storedPayroll) {
        const payrollData = JSON.parse(storedPayroll);
        if (payrollData && payrollData.statistics && payrollData.statistics.totalPayroll) {
          return payrollData.statistics.totalPayroll;
        }
      }
    } catch (error) {
      console.error('Error calculating total payroll:', error);
    }
    return '$0';
  }

  // Calculate total bonuses from all records (weekly + monthly + other only)
  calculateTotalBonuses(): string {
    try {
      const storedPayroll = localStorage.getItem('payroll');
      if (storedPayroll) {
        const payrollData = JSON.parse(storedPayroll);
        if (payrollData && payrollData.records && payrollData.records.length > 0) {
          const totalBonuses = payrollData.records.reduce((total: number, record: any) => {
            const weeklyBonus = parseFloat(record.weeklyBonus?.replace(/[^0-9.-]+/g, '') || '0');
            const monthlyBonus = parseFloat(record.monthlyBonus?.replace(/[^0-9.-]+/g, '') || '0');
            const otherBonuses = parseFloat(record.otherBonuses?.replace(/[^0-9.-]+/g, '') || '0');
            
            return total + weeklyBonus + monthlyBonus + otherBonuses;
          }, 0);
          
          return `$${totalBonuses.toFixed(2)}`;
        }
      }
    } catch (error) {
      console.error('Error calculating total bonuses from localStorage:', error);
    }
    
    const records = this.records$();
    if (!records || records.length === 0) return '$0';
    const totalBonuses = records.reduce((total, record) => {
      const weeklyBonus = parseFloat(record.weeklyBonus?.replace(/[^0-9.-]+/g, '') || '0');
      const monthlyBonus = parseFloat(record.monthlyBonus?.replace(/[^0-9.-]+/g, '') || '0');
      const otherBonuses = parseFloat(record.otherBonuses?.replace(/[^0-9.-]+/g, '') || '0');
      return total + weeklyBonus + monthlyBonus + otherBonuses;
    }, 0);
    return `$${totalBonuses.toFixed(2)}`;
  }

  // Calculate total deductions from all records
  calculateTotalDeductions(): string {
    try {
      const storedPayroll = localStorage.getItem('payroll');
      if (storedPayroll) {
        const payrollData = JSON.parse(storedPayroll);
        if (payrollData && payrollData.records && payrollData.records.length > 0) {
          const totalDeductions = payrollData.records.reduce((total: number, record: any) => {
            const deduction = parseFloat(record.deductions?.replace(/[^0-9.-]+/g, '') || '0');
            return total + Math.abs(deduction);
          }, 0);
          
          return `$${totalDeductions.toFixed(2)}`;
        }
      }
    } catch (error) {
      console.error('Error calculating total deductions from localStorage:', error);
    }
    
    const records = this.records$();
    if (!records || records.length === 0) return '$0';
    const totalDeductions = records.reduce((total, record) => {
      const deduction = parseFloat(record.deductions?.replace(/[^0-9.-]+/g, '') || '0');
      return total + Math.abs(deduction); // Use absolute value since deductions are negative
    }, 0);
    return `$${totalDeductions.toFixed(2)}`;
  }

  // Get employee count from localStorage (same as dashboard) - count only active employees
  getEmployeeCount(): number {
    try {
      const storedEmployees = localStorage.getItem('employees');
      if (storedEmployees) {
        const employees = JSON.parse(storedEmployees);
        if (Array.isArray(employees)) {
          // Count only active employees
          const activeEmployees = employees.filter(emp => emp.status === 'Active');
          return activeEmployees.length;
        }
      }
    } catch (error) {
      console.error('Error getting employee count from employees localStorage:', error);
    }
    try {
      const storedPayroll = localStorage.getItem('payroll');
      if (storedPayroll) {
        const payrollData = JSON.parse(storedPayroll);
        if (payrollData && payrollData.statistics && payrollData.statistics.employees) {
          // Note: This might need adjustment if payroll statistics don't account for active status
          return payrollData.statistics.employees;
        }
      }
    } catch (error) {
      console.error('Error getting employee count from payroll localStorage:', error);
    }
    return this.payrollData$()?.statistics?.employees || 0;
  }
}