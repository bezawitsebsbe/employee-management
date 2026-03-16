import { Injectable, signal, computed } from '@angular/core';
import { PayrollData, PayrollRecord, PayrollStatistics } from '../models/payroll.models';

export interface PayrollState {
  payrollData: PayrollData;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PayrollStore {
  private readonly initialState: PayrollState = {
    payrollData: {
      statistics: {
        totalPayroll: '$9,500.00',
        totalBonuses: '$1,200.00',
        deductions: '$780.00',
        employees: 2
      },
      records: [
        {
          department: '001 Sales',
          baseSalary: '$5,000.00',
          leaveBonus: '$0.00',
          weeklyBonus: '$200.00',
          monthlyBonus: '$900.00',
          otherBonuses: '$300.00',
          deductions: '-$450.00',
          netSalary: '$5,950.00',
          status: 'Processed'
        },
        {
          department: '002 Marketing',
          baseSalary: '$4,500.00',
          leaveBonus: '$0.00',
          weeklyBonus: '$150.00',
          monthlyBonus: '$600.00',
          otherBonuses: '$250.00',
          deductions: '-$330.00',
          netSalary: '$5,170.00',
          status: 'Processed'
        }
      ]
    },
    loading: false,
    error: null
  };

  private readonly state = signal<PayrollState>(this.initialState);

  // Public computed signals
  public readonly payrollData = computed(() => this.state().payrollData);
  public readonly records = computed(() => this.state().payrollData.records);
  public readonly statistics = computed(() => this.state().payrollData.statistics);
  public readonly loading = computed(() => this.state().loading);
  public readonly error = computed(() => this.state().error);

  // State mutations
  public setPayrollData(data: PayrollData): void {
    this.state.set({
      ...this.state(),
      payrollData: data
    });
  }

  public setLoading(loading: boolean): void {
    this.state.set({
      ...this.state(),
      loading
    });
  }

  public setError(error: string | null): void {
    this.state.set({
      ...this.state(),
      error
    });
  }

  public addRecord(record: PayrollRecord): void {
    const currentData = this.state().payrollData;
    const updatedRecords = [...currentData.records, record];
    const updatedData = {
      ...currentData,
      records: updatedRecords,
      statistics: this.calculateStatistics(updatedRecords)
    };

    this.state.set({
      ...this.state(),
      payrollData: updatedData
    });
  }

  public updateRecord(index: number, record: PayrollRecord): void {
    const currentData = this.state().payrollData;
    const updatedRecords = [...currentData.records];
    updatedRecords[index] = record;
    const updatedData = {
      ...currentData,
      records: updatedRecords,
      statistics: this.calculateStatistics(updatedRecords)
    };

    this.state.set({
      ...this.state(),
      payrollData: updatedData
    });
  }

  public deleteRecord(index: number): void {
    const currentData = this.state().payrollData;
    const updatedRecords = currentData.records.filter((_, i) => i !== index);
    const updatedData = {
      ...currentData,
      records: updatedRecords,
      statistics: this.calculateStatistics(updatedRecords)
    };

    this.state.set({
      ...this.state(),
      payrollData: updatedData
    });
  }

  public reset(): void {
    this.state.set(this.initialState);
  }

  private calculateStatistics(records: PayrollRecord[]): PayrollStatistics {
    const totalPayroll = records.reduce((sum, record) => {
      const netSalary = parseFloat(record.netSalary.replace(/[$,]/g, ''));
      return sum + netSalary;
    }, 0);

    const totalBonuses = records.reduce((sum, record) => {
      const weeklyBonus = parseFloat(record.weeklyBonus.replace(/[$,]/g, ''));
      const monthlyBonus = parseFloat(record.monthlyBonus.replace(/[$,]/g, ''));
      const otherBonuses = parseFloat(record.otherBonuses.replace(/[$,]/g, ''));
      return sum + weeklyBonus + monthlyBonus + otherBonuses;
    }, 0);

    const deductions = records.reduce((sum, record) => {
      const deduction = parseFloat(record.deductions.replace(/[$,-]/g, ''));
      return sum + deduction;
    }, 0);

    return {
      totalPayroll: `$${totalPayroll.toFixed(2)}`,
      totalBonuses: `$${totalBonuses.toFixed(2)}`,
      deductions: `-$${deductions.toFixed(2)}`,
      employees: records.length
    };
  }
}
