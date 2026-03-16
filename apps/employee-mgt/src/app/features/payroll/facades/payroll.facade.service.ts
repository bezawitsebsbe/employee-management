import { Injectable } from '@angular/core';
import { Observable, catchError, finalize, tap } from 'rxjs';
import { PayrollApiService } from '../api/payroll.api.service';
import { PayrollStore } from '../store/payroll.state';
import { PayrollData, PayrollRecord, PayrollFormData } from '../models/payroll.models';
import { Signal, computed } from '@angular/core';
import { EmployeeService } from '../../employee/api/employee.service';

@Injectable({
  providedIn: 'root'
})
export class PayrollFacadeService {
  private readonly apiService: PayrollApiService;
  private readonly store: PayrollStore;

  constructor(apiService: PayrollApiService, store: PayrollStore, private employeeService: EmployeeService) {
    this.apiService = apiService;
    this.store = store;
    
    // Load payroll data from localStorage on initialization
    this.loadFromLocalStorage();
    
    // If no data was loaded from storage, initialize from employee data
    if (!this.store.payrollData() || !this.store.payrollData()?.records || this.store.payrollData()!.records!.length === 0) {
      console.log('No payroll data loaded, initializing from employee data...');
      this.initializeFromEmployeeData();
    }
  }

  private initializeFromEmployeeData(): void {
    console.log('Generating payroll from employee service data...');
    
    // Get current employees from EmployeeService (not localStorage directly)
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        console.log('Found employees from service, creating payroll records:', employees.length);
        
        if (employees.length > 0) {
          const payrollRecords: PayrollRecord[] = employees.map(emp => ({
            department: `${emp.empId} ${emp.department}`,
            baseSalary: `$${(emp.baseSalary || 0).toFixed(2)}`,
            leaveBonus: '$0.00',
            weeklyBonus: '$0.00',
            monthlyBonus: '$0.00',
            otherBonuses: '$0.00',
            deductions: '$0.00',
            netSalary: `$${(emp.baseSalary || 0).toFixed(2)}`,
            status: 'Processed' as const
          }));
          
          // Calculate statistics
          const totalPayroll = employees.reduce((sum, emp) => sum + (emp.baseSalary || 0), 0);
          const statistics = {
            totalPayroll: `$${totalPayroll.toFixed(2)}`,
            totalBonuses: '$0.00',
            deductions: '$0.00',
            employees: employees.length
          };
          
          const payrollData: PayrollData = {
            statistics,
            records: payrollRecords
          };
          
          this.store.setPayrollData(payrollData);
          this.saveToLocalStorage();
          console.log('Payroll generated from employee service data:', payrollRecords.length);
        }
      },
      error: (error) => {
        console.error('Error getting employees from service:', error);
      }
    });
  }

  private loadFromLocalStorage(): void {
    try {
      console.log('PayrollFacade: Loading payroll data from localStorage...');
      const storedPayroll = localStorage.getItem('payroll');
      
      if (storedPayroll) {
        try {
          const parsedPayroll = JSON.parse(storedPayroll);
          if (parsedPayroll && parsedPayroll.records) {
            console.log('PayrollFacade: Loaded payroll from localStorage:', parsedPayroll.records.length);
            this.store.setPayrollData(parsedPayroll);
          }
        } catch (parseError) {
          console.error('PayrollFacade: Error parsing payroll from localStorage:', parseError);
        }
      } else {
        console.log('PayrollFacade: No payroll data in localStorage');
      }
    } catch (error) {
      console.error('PayrollFacade: Error loading from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      const currentPayrollData = this.store.payrollData();
      if (currentPayrollData) {
        localStorage.setItem('payroll', JSON.stringify(currentPayrollData));
        console.log('PayrollFacade: Saved payroll to localStorage:', currentPayrollData.records?.length);
      }
    } catch (error) {
      console.error('PayrollFacade: Error saving to localStorage:', error);
    }
  }

  // Public signals for components - use computed to ensure proper initialization
  public readonly payrollData$ = computed(() => this.store.payrollData());
  public readonly records$ = computed(() => this.store.records());
  public readonly statistics$ = computed(() => this.store.statistics());
  public readonly loading$ = computed(() => this.store.loading());
  public readonly error$ = computed(() => this.store.error());

  // Actions
  public loadPayrollData(): void {
    this.store.setLoading(true);
    this.store.setError(null);

    this.apiService.getPayrollData().pipe(
      tap(data => this.store.setPayrollData(data)),
      catchError(error => {
        const errorMessage = this.handleError(error);
        this.store.setError(errorMessage);
        throw error;
      }),
      finalize(() => this.store.setLoading(false))
    ).subscribe();
  }

  public addPayrollRecord(formData: PayrollFormData): Observable<PayrollRecord> {
    this.store.setLoading(true);
    this.store.setError(null);

    // Calculate total bonuses and deductions
    const weeklyBonus = parseFloat(formData.weeklyBonus || '0');
    const monthlyBonus = parseFloat(formData.monthlyBonus || '0');
    const jobDoneBonus = parseFloat(formData.jobDoneBonus || '0');
    const totalBonuses = weeklyBonus + monthlyBonus + jobDoneBonus;

    const deductions = parseFloat(formData.deductions || '0');

    const newRecord: PayrollRecord = {
      department: `${formData.employeeId} ${formData.department}`,
      baseSalary: `$${parseFloat(formData.baseSalary).toFixed(2)}`,
      leaveBonus: '$0.00',
      weeklyBonus: `$${weeklyBonus.toFixed(2)}`,
      monthlyBonus: `$${monthlyBonus.toFixed(2)}`,
      otherBonuses: `$${jobDoneBonus.toFixed(2)}`,
      deductions: `-$${deductions.toFixed(2)}`,
      netSalary: formData.netSalary,
      status: formData.status || 'Processed' // Use status from form
    };

    return this.apiService.savePayrollRecord(newRecord).pipe(
      tap(record => {
        this.store.addRecord(record);
        this.saveToLocalStorage(); // Save after adding
        console.log('PayrollFacade: Added record and saved to localStorage');
      }),
      catchError(error => {
        const errorMessage = this.handleError(error);
        this.store.setError(errorMessage);
        throw error;
      }),
      finalize(() => this.store.setLoading(false))
    );
  }

  public updatePayrollRecord(index: number, record: PayrollRecord): Observable<PayrollRecord> {
    this.store.setLoading(true);
    this.store.setError(null);

    return this.apiService.updatePayrollRecord(index, record).pipe(
      tap(updatedRecord => {
        this.store.updateRecord(index, updatedRecord);
        this.saveToLocalStorage(); // Save after updating
        console.log('PayrollFacade: Updated record and saved to localStorage');
      }),
      catchError(error => {
        const errorMessage = this.handleError(error);
        this.store.setError(errorMessage);
        throw error;
      }),
      finalize(() => this.store.setLoading(false))
    );
  }

  public deletePayrollRecord(index: number): Observable<void> {
    this.store.setLoading(true);
    this.store.setError(null);

    return this.apiService.deletePayrollRecord(index).pipe(
      tap(() => {
        this.store.deleteRecord(index);
        this.saveToLocalStorage(); // Save after deleting
        console.log('PayrollFacade: Deleted record and saved to localStorage');
      }),
      catchError(error => {
        const errorMessage = this.handleError(error);
        this.store.setError(errorMessage);
        throw error;
      }),
      finalize(() => this.store.setLoading(false))
    );
  }

  public exportPayrollData(): Observable<string> {
    this.store.setLoading(true);
    this.store.setError(null);

    return this.apiService.exportPayrollData().pipe(
      catchError(error => {
        const errorMessage = this.handleError(error);
        this.store.setError(errorMessage);
        throw error;
      }),
      finalize(() => this.store.setLoading(false))
    );
  }

  public clearError(): void {
    this.store.setError(null);
  }

  public resetState(): void {
    this.store.reset();
  }

  // Utility methods
  private handleError(error: any): string {
    console.error('Payroll operation failed:', error);
    
    if (error?.message?.includes('Failed to save')) {
      return 'Failed to save payroll data. Please try again.';
    }
    
    if (error?.message?.includes('Failed to fetch')) {
      return 'Failed to load payroll data. Please check your connection.';
    }
    
    return 'An unexpected error occurred. Please try again.';
  }

  // Helper methods for components
  public calculateNetSalary(formData: PayrollFormData): string {
    const base = parseFloat(formData.baseSalary) || 0;
    const weeklyBonus = parseFloat(formData.weeklyBonus) || 0;
    const monthlyBonus = parseFloat(formData.monthlyBonus) || 0;
    const jobDoneBonus = parseFloat(formData.jobDoneBonus) || 0;
    const deductions = parseFloat(formData.deductions) || 0;

    const totalBonuses = weeklyBonus + monthlyBonus + jobDoneBonus;
    const netSalary = base + totalBonuses - deductions;
    return netSalary >= 0 ? `$${netSalary.toFixed(2)}` : '$0.00';
  }

  public validatePayrollForm(formData: PayrollFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formData.employeeName?.trim()) {
      errors.push('Employee name is required');
    }

    if (!formData.employeeId?.trim()) {
      errors.push('Employee ID is required');
    }

    if (!formData.department?.trim()) {
      errors.push('Department is required');
    }

    if (!formData.baseSalary || parseFloat(formData.baseSalary) <= 0) {
      errors.push('Base salary must be greater than 0');
    }

    if (formData.deductions && parseFloat(formData.deductions) < 0) {
      errors.push('Deductions cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
