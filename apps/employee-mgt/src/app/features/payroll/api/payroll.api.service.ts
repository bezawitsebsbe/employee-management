import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { PayrollData, PayrollRecord } from '../models/payroll.models';

@Injectable({
  providedIn: 'root'
})
export class PayrollApiService {
  private readonly STORAGE_KEY = 'payroll_data';

  constructor() {
    this.initializeMockData();
  }

  // Mock API methods with localStorage persistence
  public getPayrollData(): Observable<PayrollData> {
    return of(this.getStoredData()).pipe(
      delay(500) // Simulate network delay
    );
  }

  public savePayrollRecord(record: PayrollRecord): Observable<PayrollRecord> {
    return of(record).pipe(
      delay(300), // Simulate network delay
      map(savedRecord => {
        const currentData = this.getStoredData();
        currentData.records.push(savedRecord);
        this.saveData(currentData);
        return savedRecord;
      })
    );
  }

  public updatePayrollRecord(index: number, record: PayrollRecord): Observable<PayrollRecord> {
    return of(record).pipe(
      delay(300),
      map(updatedRecord => {
        const currentData = this.getStoredData();
        if (index >= 0 && index < currentData.records.length) {
          currentData.records[index] = updatedRecord;
          this.saveData(currentData);
        }
        return updatedRecord;
      })
    );
  }

  public deletePayrollRecord(index: number): Observable<void> {
    return of(undefined).pipe(
      delay(300),
      map(() => {
        const currentData = this.getStoredData();
        if (index >= 0 && index < currentData.records.length) {
          currentData.records.splice(index, 1);
          this.saveData(currentData);
        }
      })
    );
  }

  public exportPayrollData(): Observable<string> {
    return of(this.getStoredData()).pipe(
      delay(800),
      map(data => {
        const csvContent = this.convertToCSV(data);
        return csvContent;
      })
    );
  }

  private initializeMockData(): void {
    const existingData = localStorage.getItem(this.STORAGE_KEY);
    if (!existingData) {
      const mockData: PayrollData = {
        statistics: {
          totalPayroll: '$12,820',
          totalBonuses: '$4,150',
          deductions: '$830',
          employees: 2
        },
        records: [
          {
            department: '001 Sales',
            baseSalary: '$5,000',
            leaveBonus: '$500',
            weeklyBonus: '$200',
            monthlyBonus: '$900',
            otherBonuses: '$300',
            deductions: '-$450',
            netSalary: '$6,850',
            status: 'Paid'
          },
          {
            department: '002 Marketing',
            baseSalary: '$4,500',
            leaveBonus: '$400',
            weeklyBonus: '$150',
            monthlyBonus: '$700',
            otherBonuses: '$400',
            deductions: '-$330',
            netSalary: '$5,970',
            status: 'Processed'
          }
        ]
      };
      this.saveData(mockData);
    }
  }

  private getStoredData(): PayrollData {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.getEmptyData();
    } catch (error) {
      console.error('Error reading stored data:', error);
      return this.getEmptyData();
    }
  }

  private saveData(data: PayrollData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
      throw new Error('Failed to save payroll data');
    }
  }

  private getEmptyData(): PayrollData {
    return {
      statistics: {
        totalPayroll: '$0.00',
        totalBonuses: '$0.00',
        deductions: '$0.00',
        employees: 0
      },
      records: []
    };
  }

  private convertToCSV(data: PayrollData): string {
    const headers = [
      'Department',
      'Base Salary',
      'Leave Bonus',
      'Weekly Bonus',
      'Monthly Bonus',
      'Other Bonuses',
      'Deductions',
      'Net Salary',
      'Status'
    ];

    const csvRows = [
      headers.join(','),
      ...data.records.map(record => [
        record.department,
        record.baseSalary,
        record.leaveBonus,
        record.weeklyBonus,
        record.monthlyBonus,
        record.otherBonuses,
        record.deductions,
        record.netSalary,
        record.status
      ].join(','))
    ];

    return csvRows.join('\n');
  }
}
