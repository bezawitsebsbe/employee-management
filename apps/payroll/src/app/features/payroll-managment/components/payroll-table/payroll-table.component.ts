import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { PayrollRecord } from '../../models/payroll.models';

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
    NzTypographyModule
  ],
  templateUrl: './payroll-table.component.html',
  styleUrls: ['./payroll-table.component.scss']
})
export class PayrollTableComponent {
  @Input() searchTerm: string = '';
  @Input() selectedDepartment: string = 'all';
  
  @Output() editRecord = new EventEmitter<PayrollRecord>();
  @Output() deleteRecord = new EventEmitter<PayrollRecord>();

  payrollRecords: PayrollRecord[] = [
    {
      id: '1',
      employeeName: 'John Doe',
      employeeId: 'EMP001',
      department: 'Engineering',
      position: 'Senior Developer',
      baseSalary: 5000,
      weeklyBonus: 200,
      monthlyBonus: 500,
      jobDoneBonus: 300,
      deductions: 750,
      netSalary: 4250,
      status: 'Processed',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      employeeName: 'Jane Smith',
      employeeId: 'EMP002',
      department: 'Design',
      position: 'UI/UX Designer',
      baseSalary: 4500,
      weeklyBonus: 150,
      monthlyBonus: 300,
      jobDoneBonus: 200,
      deductions: 675,
      netSalary: 3975,
      status: 'Processed',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      employeeName: 'Mike Johnson',
      employeeId: 'EMP003',
      department: 'Management',
      position: 'Project Manager',
      baseSalary: 6000,
      weeklyBonus: 300,
      monthlyBonus: 800,
      jobDoneBonus: 400,
      deductions: 900,
      netSalary: 5600,
      status: 'Paid',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '4',
      employeeName: 'Sarah Williams',
      employeeId: 'EMP004',
      department: 'Engineering',
      position: 'Junior Developer',
      baseSalary: 3500,
      weeklyBonus: 100,
      monthlyBonus: 200,
      jobDoneBonus: 150,
      deductions: 525,
      netSalary: 3425,
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '5',
      employeeName: 'Tom Brown',
      employeeId: 'EMP005',
      department: 'Engineering',
      position: 'Data Analyst',
      baseSalary: 4200,
      weeklyBonus: 175,
      monthlyBonus: 350,
      jobDoneBonus: 250,
      deductions: 630,
      netSalary: 3945,
      status: 'Processed',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

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

  onEditRecord(record: PayrollRecord): void {
    this.editRecord.emit(record);
  }

  onDeleteRecord(record: PayrollRecord): void {
    this.deleteRecord.emit(record);
  }
}
