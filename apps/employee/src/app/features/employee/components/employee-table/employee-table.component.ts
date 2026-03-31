import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectorRef, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { EntityTableComponent, EntityColumn, EntityAction, EntityTableData, EntityConfig, EntitySetting } from '@employee-payroll/entity';
import { Employee } from '../../models/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';
import { take, filter } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class EmployeeTableComponent implements OnInit, OnDestroy {
  @Input() employees: Employee[] = [];
  @Input() loading = false;
  
  @Output() viewEmployee = new EventEmitter<Employee>();
  @Output() editEmployee = new EventEmitter<Employee>();
  @Output() deleteEmployee = new EventEmitter<Employee>();
  @Output() filtersChange = new EventEmitter<any>();

  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private facade = inject(EmployeeSimpleFacade);
  private message = inject(NzMessageService);
  
  private destroy$ = new Subject<void>();

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
      label: 'Detail',
      icon: 'eye',
      type: 'view',
      routerLink: (employee: Employee) => {
      console.log('RouterLink called for employee:', employee.id);
      const route = ['/employee/detail', employee.id || ''];
      console.log('Generated route:', route);
      return route;
    }
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: 'delete',
      type: 'delete',
      callback: (employee: Employee) => this.confirmDelete(employee)
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
    selectable: false,  // ✅ Remove checkbox column
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


  ngOnInit(): void {
    // Subscribe to employees from facade for automatic updates
    this.facade.employees$.pipe(takeUntil(this.destroy$)).subscribe(employees => {
      this.employees = employees;
      this.updateTableData();
    });
    
    // Initial load if no employees
    if (this.employees.length === 0) {
      this.facade.loadEmployees();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      case 'detail':
        // Navigate to employee detail page
        console.log('Detail action triggered for employee:', event.data.id);
        const route = ['/employee/detail', event.data.id];
        console.log('Navigating to route:', route);
        this.router.navigate(route).then(navResult => {
          console.log('Navigation result:', navResult);
        });
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

  confirmDelete(employee: Employee): void {
    if (confirm(`Are you sure you want to delete employee "${employee.fullName}"?`)) {
      this.facade.deleteEmployee(employee.id || '');
      this.message.success('Employee deleted successfully');
      
      // Refresh the employee list after a short delay
      setTimeout(() => {
        this.facade.loadEmployees();
        this.updateTableData();
      }, 1000);
    }
  }
}
