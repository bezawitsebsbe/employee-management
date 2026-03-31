import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { Employee } from '../../models/employee.model';
import { EntityTableComponent, EntityColumn, EntityAction, EntityTableData } from '@employee-payroll/entity';

@Component({
  selector: 'app-employee-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzTagModule,
    NzTabsModule,
    NzInputModule,
    NzSelectModule,
    EntityTableComponent
  ],
  templateUrl: './employee-table.component.html',
  styleUrls: ['./employee-table.component.scss']
})
export class EmployeeTableComponent implements OnInit {
  @Input() employees: Employee[] = [];
  @Input() loading = false;
  
  @Output() viewEmployee = new EventEmitter<Employee>();
  @Output() editEmployee = new EventEmitter<Employee>();
  @Output() deleteEmployee = new EventEmitter<Employee>();
  @Output() filtersChange = new EventEmitter<any>();

  // Table data
  tableData: EntityTableData = {
    items: [],
    totalItems: 0,
    currentPage: 1,
    pageSize: 10
  };

  // Table configurations
  tableActions: EntityAction[] = [
    {
      key: 'view',
      label: 'View',
      icon: 'eye',
      type: 'view',
      routerLink: (employee: Employee) => ['../detail', employee.id || '']
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: 'edit',
      type: 'edit',
      routerLink: (employee: Employee) => ['../edit', employee.id || '']
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'delete',
      type: 'delete',
      callback: (employee: Employee) => this.deleteEmployee.emit(employee)
    }
  ];

  tableConfig = {
    title: 'Employee List',
    searchable: true,
    paginated: true,
    pageSize: 10,
    showSizeChanger: true,
    frontPagination: true,
    useClickHandler: true,
    detailUrl: '../detail',
    selectable: true,
    actions: this.tableActions
  };

  tableColumns: EntityColumn[] = [
    {
      key: 'empId',
      name: 'Employee ID',
      label: 'Employee ID',
      type: 'text',
      sortable: true,
      width: '120px'
    },
    {
      key: 'fullName',
      name: 'Full Name',
      label: 'Full Name',
      type: 'text',
      sortable: true,
      width: '200px'
    },
    {
      key: 'email',
      name: 'Email',
      label: 'Email',
      type: 'email',
      sortable: true,
      width: '250px'
    },
    {
      key: 'department',
      name: 'Department',
      label: 'Department',
      type: 'tag',
      sortable: true,
      width: '150px',
      tagColors: {
        'Sales': '#108ee9',
        'Marketing': '#87d068',
        'HR': '#f50',
        'Finance': '#2db7f5',
        'IT': '#722ed1'
      }
    },
    {
      key: 'position',
      name: 'Position',
      label: 'Position',
      type: 'text',
      sortable: true,
      width: '180px'
    },
    {
      key: 'status',
      name: 'Status',
      label: 'Status',
      type: 'tag',
      sortable: true,
      width: '100px',
      tagColors: {
        'Active': '#52c41a',
        'Inactive': '#ff4d4f',
        'On Leave': '#faad14'
      }
    },
    {
      key: 'joinDate',
      name: 'Join Date',
      label: 'Join Date',
      type: 'date',
      sortable: true,
      width: '120px'
    }
  ];

  tableSetting = {
    identity: 'id',
    visibleColumns: this.tableColumns,
    primaryColumn: this.tableColumns[1],
    actions: this.tableActions,
    showDetail: false,
    showTabs: true,
    showFilters: true,
    showSearch: true
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.updateTableData();
  }

  ngOnChanges(): void {
    this.updateTableData();
  }

  private updateTableData(): void {
    this.tableData = {
      items: this.employees,
      totalItems: this.employees.length,
      currentPage: 1,
      pageSize: 10
    };
    this.cdr.detectChanges();
  }

  onTableAction(event: { action: string; data: Employee }): void {
    switch (event.action) {
      case 'view':
        this.viewEmployee.emit(event.data);
        break;
      case 'edit':
        this.editEmployee.emit(event.data);
        break;
      case 'delete':
        this.deleteEmployee.emit(event.data);
        break;
      default:
        console.log('Unknown action:', event.action, event.data);
    }
  }

  onFiltersChange(filters: any): void {
    this.filtersChange.emit(filters);
  }

  onSortChange(sort: any): void {
    console.log('Sort changed:', sort);
  }

  onPaginationChange(pagination: any): void {
    console.log('Pagination changed:', pagination);
  }
}
