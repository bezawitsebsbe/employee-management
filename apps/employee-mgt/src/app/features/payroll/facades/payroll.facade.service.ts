import { Injectable } from '@angular/core';
import { Observable, catchError, finalize, tap } from 'rxjs';
import { PayrollApiService } from '../api/payroll.api.service';
import { PayrollStore } from '../store/payroll.state';
import { PayrollData, PayrollRecord, PayrollFormData } from '../models/payroll.models';

@Injectable({
  providedIn: 'root'
})
export class PayrollFacadeService {
  private readonly apiService: PayrollApiService;
  private readonly store: PayrollStore;

  constructor(apiService: PayrollApiService, store: PayrollStore) {
    this.apiService = apiService;
    this.store = store;
  }

  // Public signals for components
  public get payrollData$() {
    return this.store.payrollData;
  }

  public get records$() {
    return this.store.records;
  }

  public get statistics$() {
    return this.store.statistics;
  }

  public get loading$() {
    return this.store.loading;
  }

  public get error$() {
    return this.store.error;
  }

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
      tap(record => this.store.addRecord(record)),
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
      tap(updatedRecord => this.store.updateRecord(index, updatedRecord)),
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
      tap(() => this.store.deleteRecord(index)),
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
