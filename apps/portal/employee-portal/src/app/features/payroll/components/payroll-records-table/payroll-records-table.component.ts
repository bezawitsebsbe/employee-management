import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PayrollRecord } from '../../models/payroll.models';

@Component({
  selector: 'app-payroll-records-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payroll-records-table.component.html',
  styleUrl: './payroll-records-table.component.scss'
})
export class PayrollRecordsTableComponent {
  @Input() records!: PayrollRecord[];

  displayedColumns = [
    'department',
    'baseSalary',
    'leaveBonus',
    'weeklyBonus',
    'monthlyBonus',
    'otherBonuses',
    'deductions',
    'netSalary',
    'status'
  ];

  public columnHeaders = {
    department: 'Department',
    baseSalary: 'Base Salary',
    leaveBonus: 'Leave Bonus',
    weeklyBonus: 'Weekly Bonus',
    monthlyBonus: 'Monthly Bonus',
    otherBonuses: 'Other Bonuses',
    deductions: 'Deductions',
    netSalary: 'Net Salary',
    status: 'Status'
  };

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
}
