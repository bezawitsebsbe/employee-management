import { Component, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Signal } from '@angular/core';
import { AddPayrollRecordModalComponent } from '../../components/add-payroll-record-modal/add-payroll-record-modal.component';
import { PayrollData, PayrollFormData, PayrollRecord } from '../../models/payroll.models';
import { PayrollFacadeService } from '../../facades/payroll.facade.service';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddPayrollRecordModalComponent
  ],
  templateUrl: './payroll.component.html',
  styleUrl: './payroll.component.scss'
})
export class PayrollComponent implements OnInit, OnDestroy {
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
    private readonly router: Router
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
    const records = this.records$();
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
    
    const filtered = records.filter(record => {
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
      const searchDepartmentMatch = departmentText.includes(search) && !/^\d+$/.test(search);
      const departmentFilterMatch = !department || departmentName === department || department === 'all departments';
      
      console.log('Exact ID match:', exactIdMatch, 'Search department match:', searchDepartmentMatch, 'Department filter match:', departmentFilterMatch);
      
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
    this.payrollFacade.exportPayrollData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (csvData) => {
          this.downloadCSV(csvData);
        },
        error: (error) => {
          console.error('Export failed:', error);
        }
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
    const actualRecords = this.records$();
    console.log('All records:', actualRecords);
    const actualIndex = actualRecords.findIndex(r => r === record);
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
      const actualRecords = this.records$();
      const actualIndex = actualRecords.findIndex(record => 
        this.filteredRecords[index] === record
      );
      
      if (actualIndex !== -1) {
        this.payrollFacade.deletePayrollRecord(actualIndex)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              console.log('Record deleted successfully');
              // Update filtered records after deletion
              setTimeout(() => this.updateFilteredRecords(), 100);
            },
            error: (error) => {
              console.error('Failed to delete record:', error);
              alert('Failed to delete record. Please try again.');
            }
          });
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
      this.payrollFacade.updatePayrollRecord(this.editingIndex, updatedRecord)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            console.log('Update successful:', result);
            this.showEditModal = false;
            this.editingRecord = null;
            this.editingIndex = -1;
            // Update filtered records after update
            setTimeout(() => this.updateFilteredRecords(), 100);
          },
          error: (error) => {
            console.error('Failed to update record:', error);
            alert('Failed to update record. Please try again.');
          }
        });
    } else {
      console.error('Invalid editing index or record:', this.editingIndex, updatedRecord);
    }
  }

  onSavePayroll(formData: PayrollFormData): void {
    this.payrollFacade.addPayrollRecord(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.showAddModal = false;
          // Update filtered records after adding new record
          setTimeout(() => this.updateFilteredRecords(), 100);
        },
        error: (error) => {
          console.error('Failed to save payroll record:', error);
        }
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
}