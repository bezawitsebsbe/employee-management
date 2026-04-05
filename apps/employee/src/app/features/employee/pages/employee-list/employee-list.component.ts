import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivationStart, ActivationEnd, ActivatedRoute } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Subject, takeUntil } from 'rxjs';
import { map, startWith, filter } from 'rxjs/operators';

import { EntityTableComponent, EntityColumn, EntityAction, EntityTableData, EntityConfig, EntitySetting } from '@employee-payroll/entity';
import { Employee } from '../../models/employee.model';
import { EmployeeSimpleFacade } from '../../facades/employee-simple.facade';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzIconModule,
    EntityTableComponent
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  loading = false;
  
  private facade = inject(EmployeeSimpleFacade);
  private message = inject(NzMessageService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  
  // Observable for detail panel visibility - shows for detail and add routes
  hasDetail$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => {
      const childRoute = this.route.firstChild;
      const hasChild = !!childRoute;
      const childPath = childRoute?.snapshot?.routeConfig?.path;
      console.log('🔥 hasDetail$ updated:', hasChild);
      console.log('🔥 Current URL:', this.router.url);
      console.log('🔥 First child route:', childPath);
      return hasChild;
    }),
    startWith(false)
  );

  // Table configurations
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

  // Compact columns for detail view
  compactTableColumns: EntityColumn[] = [
    {
      key: 'fullName',
      name: 'Full Name',
      label: 'Full Name',
      type: 'text',
      sortable: true,
      width: '200px'
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
    }
  ];

  // Base table setting
  baseTableSetting: EntitySetting = {
    identity: 'id',
    primaryColumn: this.tableColumns[1], 
    actions: [],
    showTabs: true,
    showFilters: true
  };

  // Dynamic table configuration based on detail state
  tableConfig$ = this.hasDetail$.pipe(
    map(hasDetail => {
      const visibleColumns = hasDetail ? this.compactTableColumns : this.tableColumns;
      const config = {
        ...this.baseTableSetting,
        visibleColumns,
        actions: this.tableActions
      } as EntityConfig;
      console.log('✅ TABLE CONFIG EMITTED:', config);
      return config;
    })
  );

  // Table configurations
  tableActions: EntityAction[] = [
    {
      key: 'view',
      label: 'Detail',
      icon: 'eye',
      type: 'view',
      callback: (employee: Employee) => {
        console.log('View employee:', employee.id);
        this.router.navigate(['detail', employee.id], { relativeTo: this.route });
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

  // Add Employee action for table header
  addEmployeeAction: EntityAction = {
    key: 'add',
    label: 'Add Employee',
    icon: 'plus',
    type: 'primary',
    routerLink: ['add']
  };

  // Table data
  tableData: EntityTableData = {
    items: [],
    totalItems: 0,
    currentPage: 1,
    pageSize: 10
  };

  tableSetting: EntitySetting = {
    ...this.baseTableSetting,
    visibleColumns: this.tableColumns
  };

  ngOnInit(): void {
    console.log('');
    
    this.facade.loadEmployees();
    
    // Subscribe to router events to track navigation
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        console.log(' URL changed to:', e.url);
        console.log(' Route params:', e.url.split('/'));
      }
      if (e instanceof ActivationStart) {
        console.log(' Route activation start:', e);
      }
      if (e instanceof ActivationEnd) {
        console.log(' Route activation end:', e);
      }
    });
    
    // Subscribe to employees from facade for automatic updates
    this.facade.employees$.pipe(takeUntil(this.destroy$)).subscribe((employees: Employee[]) => {
      this.updateTableData(employees);
    });
    
    // Update columns based on detail state
    this.tableConfig$.pipe(takeUntil(this.destroy$)).subscribe((config: EntityConfig) => {
      this.tableSetting = { ...this.baseTableSetting, visibleColumns: config.visibleColumns };
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEmployees(): void {
    this.loading = true;
    this.facade.loadEmployees();
  }

  private updateTableData(employees: Employee[]): void {
    this.tableData = {
      items: employees,
      totalItems: employees.length,
      currentPage: 1,
      pageSize: 10
    };
    this.loading = false;
  }

  getDetailTitle(): string {
    const childRoute = this.route.firstChild;
    const childPath = childRoute?.snapshot?.routeConfig?.path;
    
    if (childPath === 'add') {
      return 'Add New Employee';
    } else if (childPath === 'detail') {
      return 'Employee Details';
    } else {
      return 'Employee Details';
    }
  }

  onTableAction(event: { action: string; data: Employee }): void {
    console.log('🔥 onTableAction called with:', event);
    
    switch (event.action) {
      case 'view':
        console.log('View employee:', event.data);
        // Navigate to detail route but stay in same component
        this.router.navigate(['detail', event.data.id], { relativeTo: this.route });
        break;
      case 'delete':
        console.log('Delete employee:', event.data);
        this.confirmDelete(event.data);
        break;
      case 'detail':
        // Navigate to employee detail page using child route
        console.log('Detail action triggered for employee:', event.data.id);
        this.router.navigate(['detail', event.data.id], { relativeTo: this.route }).then((navResult: boolean) => {
          console.log('Navigation result:', navResult);
        });
        break;
      default:
        console.log('Unknown action:', event.action, event.data);
    }
  }

  onFiltersChange(filters: any): void {
    console.log('Filters changed:', filters);
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
      }, 1000);
    }
  }

  closeDetail(): void {
    this.router.navigate(['/employee']);
  }
}
