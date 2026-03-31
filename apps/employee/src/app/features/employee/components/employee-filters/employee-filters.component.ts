import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { Employee } from '../../models/employee.model';

export interface EmployeeFilters {
  search: string;
  department: string;
  status: string;
  activeTab: number;
}

@Component({
  selector: 'app-employee-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
    NzSelectModule,
    NzButtonModule,
    NzIconModule
  ],
  templateUrl: './employee-filters.component.html',
  styleUrls: ['./employee-filters.component.scss']
})
export class EmployeeFiltersComponent implements OnInit {
  @Input() employees: Employee[] = [];
  @Input() filters: EmployeeFilters = {
    search: '',
    department: '',
    status: '',
    activeTab: 0
  };
  
  @Output() filtersChange = new EventEmitter<EmployeeFilters>();
  @Output() tabChange = new EventEmitter<number>();

  searchTerm = '';
  departmentFilter = '';
  statusFilter = '';

  ngOnInit(): void {
    this.updateLocalFilters();
  }

  ngOnChanges(): void {
    this.updateLocalFilters();
  }

  private updateLocalFilters(): void {
    this.searchTerm = this.filters.search;
    this.departmentFilter = this.filters.department;
    this.statusFilter = this.filters.status;
  }

  onSearchChange(): void {
    this.emitFiltersChange();
  }

  onDepartmentChange(): void {
    this.emitFiltersChange();
  }

  onStatusChange(): void {
    this.emitFiltersChange();
  }

  onTabChange(index: number): void {
    this.tabChange.emit(index);
    this.emitFiltersChange();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.departmentFilter = '';
    this.statusFilter = '';
    this.emitFiltersChange();
  }

  private emitFiltersChange(): void {
    const filters: EmployeeFilters = {
      search: this.searchTerm,
      department: this.departmentFilter,
      status: this.statusFilter,
      activeTab: this.filters.activeTab
    };
    this.filtersChange.emit(filters);
  }

  getUniqueDepartments(): string[] {
    const departments = [...new Set(this.employees.map(emp => emp.department).filter(Boolean))];
    return departments.sort();
  }

  getUniqueStatuses(): string[] {
    const statuses = [...new Set(this.employees.map(emp => emp.status).filter(Boolean))];
    return statuses.sort();
  }

  getActiveEmployeeCount(): number {
    return this.employees.filter(emp => emp.status === 'Active').length;
  }

  getInactiveEmployeeCount(): number {
    return this.employees.filter(emp => emp.status === 'Inactive' || emp.status === 'On Leave').length;
  }
}
