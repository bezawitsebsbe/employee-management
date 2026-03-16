import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { Employee } from '../../api/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';
import { EmployeeListComponent } from '../../components/employee-list/employee-list.component';
import { EmployeeDetailComponent } from '../../components/employee-detail/employee-detail.component';
import { AddEmployeeModalComponent } from '../../components/add-employee-modal/add-employee-modal.component';
import { SidebarComponent } from '@employee-payroll/sidebar';

@Component({
  selector: 'app-employee-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzCardModule,
    NzStatisticModule,
    NzIconModule,
    NzSelectModule,
    NzInputModule,
    NzButtonModule,
    NzTagModule,
    NzTabsModule,
    SidebarComponent,
    EmployeeListComponent,
    EmployeeDetailComponent,
    AddEmployeeModalComponent,
  ],
  templateUrl: './employee-page.component.html',
  styleUrls: ['./employee-page.component.scss'],
})
export class EmployeePageComponent {
  sidebarItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Employee', icon: '👥', path: '/employees' },
    { label: 'Payroll', icon: '💰', path: '/payroll' },
    { label: 'Attendance', icon: '🕒', path: '/attendance' },
  ];
  private facade = inject(EmployeeSimpleFacade);
  
  @ViewChild('addEmployeeModal') addEmployeeModal!: AddEmployeeModalComponent;

  // Expose facade signals to template
  employees = this.facade.employees;
  selectedEmployee = this.facade.selectedEmployee;
  filteredEmployees = this.facade.filteredEmployees;
  summary = this.facade.summary;
  loading = this.facade.loading;
  error = this.facade.error;
  searchTerm = this.facade.searchTerm;
  departmentFilter = this.facade.departmentFilter;
  statusFilter = this.facade.statusFilter;

  constructor() {
    // Data loading is handled by the facade
  }

  selectEmployee(emp: Employee | null) {
    this.facade.selectEmployee(emp);
  }

  setSearchTerm(term: string) {
    this.facade.setSearchTerm(term);
  }

  setDepartmentFilter(dept: string | null) {
    this.facade.setDepartmentFilter(dept);
  }

  setStatusFilter(status: string | null) {
    this.facade.setStatusFilter(status);
  }

  // Add employee functionality
  addNewEmployee() {
    this.addEmployeeModal.show();
  }

  // Export functionality
  exportEmployees() {
    try {
      const employees = this.facade.employees();
      if (!employees || employees.length === 0) {
        alert('No employees to export');
        return;
      }

      let csv = 'Employee ID,Full Name,Email,Phone,Department,Position,Join Date,Status,Base Salary,Performance\n';
      
      employees.forEach(emp => {
        csv += `"${emp.empId}","${emp.fullName}","${emp.email}","${emp.phone || ''}","${emp.department}","${emp.position}","${emp.joinDate}","${emp.status}","${emp.baseSalary || 0}","${emp.performance || 0}"\n`;
      });
      
      this.downloadCSV(csv);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  }

  private downloadCSV(csvData: string): void {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
