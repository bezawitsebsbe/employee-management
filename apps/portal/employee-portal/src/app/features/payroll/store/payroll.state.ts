import { Injectable, signal } from '@angular/core';
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
          netSalary: '$6,850.00',
          status: 'Paid'
        },
        {
          department: '002 Marketing',
          baseSalary: '$4,500.00',
          leaveBonus: '$0.00',
          weeklyBonus: '$150.00',
          monthlyBonus: '$700.00',
          otherBonuses: '$400.00',
          deductions: '-$330.00',
          netSalary: '$5,970.00',
          status: 'Processed'
        }
      ]
    },
    loading: false,
    error: null
  };

  // State signals
  public readonly payrollData = signal<PayrollData>(this.initialState.payrollData);
  public readonly loading = signal<boolean>(this.initialState.loading);
  public readonly error = signal<string | null>(this.initialState.error);

  // Computed signals
  public readonly records = signal<PayrollRecord[]>(this.initialState.payrollData.records);
  public readonly statistics = signal<PayrollStatistics>(this.initialState.payrollData.statistics);

  // Actions
  public setLoading(loading: boolean): void {
    this.loading.set(loading);
  }

  public setError(error: string | null): void {
    this.error.set(error);
  }

  public setPayrollData(data: PayrollData): void {
    this.payrollData.set(data);
    this.records.set(data.records);
    this.statistics.set(data.statistics);
  }

  public addRecord(record: PayrollRecord): void {
    console.log('Adding record to store:', record);
    const currentData = this.payrollData();
    const updatedRecords = [...currentData.records, record];
    const updatedData = {
      ...currentData,
      records: updatedRecords,
      statistics: this.calculateStatistics(updatedRecords)
    };
    console.log('Updated records in store:', updatedRecords);
    this.setPayrollData(updatedData);
  }

  public updateRecord(index: number, record: PayrollRecord): void {
    const currentData = this.payrollData();
    const updatedRecords = [...currentData.records];
    updatedRecords[index] = record;
    const updatedData = {
      ...currentData,
      records: updatedRecords,
      statistics: this.calculateStatistics(updatedRecords)
    };
    this.setPayrollData(updatedData);
  }

  public deleteRecord(index: number): void {
    const currentData = this.payrollData();
    const updatedRecords = currentData.records.filter((_, i) => i !== index);
    const updatedData = {
      ...currentData,
      records: updatedRecords,
      statistics: this.calculateStatistics(updatedRecords)
    };
    this.setPayrollData(updatedData);
  }

  private calculateStatistics(records: PayrollRecord[]): PayrollStatistics {
    const totalEmployees = records.length;
    let totalPayroll = 0;
    let totalBonuses = 0;
    let totalDeductions = 0;

    records.forEach(record => {
      const baseSalary = parseFloat(record.baseSalary.replace('$', '')) || 0;
      const leaveBonus = parseFloat(record.leaveBonus.replace('$', '')) || 0;
      const weeklyBonus = parseFloat(record.weeklyBonus.replace('$', '')) || 0;
      const monthlyBonus = parseFloat(record.monthlyBonus.replace('$', '')) || 0;
      const otherBonuses = parseFloat(record.otherBonuses.replace('$', '')) || 0;
      const deductions = parseFloat(record.deductions.replace('-$', '')) || 0;

      totalPayroll += baseSalary;
      totalBonuses += leaveBonus + weeklyBonus + monthlyBonus + otherBonuses;
      totalDeductions += deductions;
    });

    return {
      totalPayroll: `$${totalPayroll.toFixed(2)}`,
      totalBonuses: `$${totalBonuses.toFixed(2)}`,
      deductions: `$${totalDeductions.toFixed(2)}`,
      employees: totalEmployees
    };
  }

  public reset(): void {
    this.payrollData.set(this.initialState.payrollData);
    this.loading.set(this.initialState.loading);
    this.error.set(this.initialState.error);
    this.records.set(this.initialState.payrollData.records);
    this.statistics.set(this.initialState.payrollData.statistics);
  }
}
