import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EmployeeListComponent } from '../employee-list/employee-list.component';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';

@Component({
  selector: 'app-employee-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzButtonModule,
    NzIconModule,
    EmployeeListComponent
  ],
  templateUrl: './employee-page.component.html',
  styleUrls: ['./employee-page.component.scss'],
})
export class EmployeePageComponent implements OnInit {
  private facade = inject(EmployeeSimpleFacade);
  private message = inject(NzMessageService);

  constructor() {}

  ngOnInit(): void {
    // Initialize any required data
  }

  // Export functionality
  exportEmployees(): void {
    this.facade.employees$.subscribe(employees => {
      if (!employees || employees.length === 0) {
        this.message.error('No employees to export');
        return;
      }

      // Create CSV data
      const headers = ['Employee ID', 'Full Name', 'Email', 'Phone', 'Department', 'Position', 'Status', 'Join Date', 'Base Salary', 'Performance', 'Created At', 'Updated At'];
      const csvData = employees.map(emp => [
        emp.empId || emp.id,
        emp.fullName,
        emp.email,
        emp.phone || '',
        emp.department,
        emp.position,
        emp.status,
        emp.joinDate,
        emp.baseSalary || 0,
        emp.performance || 0,
        emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '',
        emp.updatedAt ? new Date(emp.updatedAt).toLocaleDateString() : ''
      ]);

      // Convert to CSV
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `employees-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      this.message.success(`Exported ${employees.length} employees to CSV`);
    });
  }
}