import { Component, inject, ViewChild, OnInit } from '@angular/core';
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
import { Observable, BehaviorSubject, map } from 'rxjs';
import { Store } from '@ngxs/store';
import { Employee } from '../../models/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';
import { EmployeeState } from '../../store/state/employee.state';
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
export class EmployeePageComponent implements OnInit {
  sidebarItems = [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Employee', icon: '👥', path: '/employees' },
    { label: 'Attendance', icon: '🕒', path: '/attendance' },
  ];
  
  @ViewChild('addEmployeeModal') addEmployeeModal!: AddEmployeeModalComponent;

  // Local state for filters and search
  searchTerm = '';
  departmentFilter: string | null = null;
  statusFilter: string | null = null;

  // Component state
  employees: Employee[] = [];
  selectedEmployee: Employee | null = null;

  constructor(
    private readonly store: Store,
    private readonly facade: EmployeeSimpleFacade
  ) {}

  ngOnInit(): void {
    // Load initial data
    this.facade.loadEmployees();
    
    // Use store.selectSnapshot for synchronous data access
    this.refreshEmployeeData();
  }

  private refreshEmployeeData(): void {
    this.employees = this.store.selectSnapshot(EmployeeState.employees) || [];
    this.selectedEmployee = this.store.selectSnapshot(EmployeeState.selectedEmployee) || null;
  }

  selectEmployee(emp: Employee | null) {
    if (emp) {
      this.facade.loadEmployee(emp.id);
      // Update local state using selectSnapshot
      this.refreshEmployeeData();
    }
  }

  // Filter methods
  setSearchTerm(term: string): void {
    this.searchTerm = term;
  }

  setDepartmentFilter(dept: string | null): void {
    this.departmentFilter = dept;
  }

  setStatusFilter(status: string | null): void {
    this.statusFilter = status;
  }

  // Get summary data
  get summary() {
    return {
      totalEmployees: this.employees.length,
      active: this.employees.filter(emp => emp.status === 'Active').length,
      avgPerformance: 5, // Placeholder - calculate from departments
      totalPayroll: this.employees.reduce((sum, emp) => sum + (emp.baseSalary || 0), 0)
    };
  }

  // Add employee functionality
  addNewEmployee() {
    this.addEmployeeModal.show();
  }

  handleAddEmployee(employee: any) {
    this.facade.createEmployee(employee);
  }

  handleUpdateEmployee(id: string, changes: any) {
    this.facade.updateEmployee(id, changes);
  }

  handleDeleteEmployee(id: string) {
    this.facade.deleteEmployee(id);
  }

  // Export functionality
  exportEmployees() {
    if (!this.employees || this.employees.length === 0) {
      alert('No employees to export');
      return;
    }

    let csv = 'Employee ID,Full Name,Email,Phone,Department,Position,Join Date,Status,Base Salary,Performance\n';
    
    this.employees.forEach(emp => {
      csv += `"${emp.empId}","${emp.fullName}","${emp.email}","${emp.phone || ''}","${emp.department}","${emp.position}","${emp.joinDate}","${emp.status}","${emp.baseSalary || 0}","${emp.performance || 0}"\n`;
    });
    
    this.downloadCSV(csv);
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
