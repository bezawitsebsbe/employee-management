import { Component, inject, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { Observable, BehaviorSubject, map, combineLatest } from 'rxjs';
import { Store } from '@ngxs/store';
import { Employee } from '../../models/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';
import { EmployeeState } from '../../store/state/employee.state';
import { EmployeeListComponent } from '../../components/employee-list/employee-list.component';
import { EmployeeDetailComponent } from '../../components/employee-detail/employee-detail.component';
import { AddEmployeeModalComponent } from '../../components/add-employee-modal/add-employee-modal.component';
import { SidebarComponent } from '@employee-payroll/sidebar';
import * as _ from 'lodash';

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
  filteredEmployees: Employee[] = [];
  private cdr = inject(ChangeDetectorRef);

  constructor(
    private readonly store: Store,
    private readonly facade: EmployeeSimpleFacade
  ) {}

  ngOnInit(): void {
    // Load initial data
    this.facade.loadEmployees();
    
    // Subscribe to employees observable
    this.facade.employees$.subscribe((employees) => {
      this.employees = employees;
      this.applyFilters();
      
      this.summary = {
        totalEmployees: employees.length,
        active: employees.filter(e => e.status === 'Active').length,
        avgPerformance: 5,
        totalPayroll: employees.reduce((sum, e) => sum + (e.baseSalary || 0), 0)
      };
      
      this.cdr.detectChanges();
    });
    
    // Subscribe to selected employee observable
    this.facade.selectedEmployee$.subscribe((employee) => {
      this.selectedEmployee = employee;
      this.cdr.detectChanges();
    });
  }

  selectEmployee(emp: Employee | null) {
    if (emp && emp.id) {
      this.facade.loadEmployee(emp.id);
    }
  }

  // Filter methods
  setSearchTerm(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }

  setDepartmentFilter(dept: string | null): void {
    this.departmentFilter = dept;
    this.applyFilters();
  }

  setStatusFilter(status: string | null): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  // Apply all filters using lodash
  private applyFilters(): void {
    console.log('🔍 Applying filters:', {
      searchTerm: this.searchTerm,
      departmentFilter: this.departmentFilter,
      statusFilter: this.statusFilter,
      totalEmployees: this.employees.length
    });

    let filtered = [...this.employees];

    // Search filter (case-insensitive search in multiple fields) - using native filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      console.log('🔍 Searching for:', searchLower);
      filtered = filtered.filter((emp: Employee) => 
        emp.fullName.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.empId.toLowerCase().includes(searchLower) ||
        (emp.department && emp.department.toLowerCase().includes(searchLower)) ||
        (emp.position && emp.position.toLowerCase().includes(searchLower))
      );
      console.log('🔍 Search results:', filtered.length, 'employees');
    }

    // Department filter - using lodash object predicate
    if (this.departmentFilter) {
      console.log('🔍 Filtering by department:', this.departmentFilter);
      filtered = filtered.filter((emp: Employee) => emp.department === this.departmentFilter);
      console.log('🔍 Department filter results:', filtered.length, 'employees');
    }

    // Status filter - using lodash object predicate
    if (this.statusFilter) {
      console.log('🔍 Filtering by status:', this.statusFilter);
      filtered = filtered.filter((emp: Employee) => emp.status === this.statusFilter);
      console.log('🔍 Status filter results:', filtered.length, 'employees');
    }

    console.log('🔍 Final filtered employees:', filtered.length);
    this.filteredEmployees = filtered;
    this.cdr.detectChanges();
  }

  summary = {
    totalEmployees: 0,
    active: 0,
    avgPerformance: 5,
    totalPayroll: 0
  };

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
