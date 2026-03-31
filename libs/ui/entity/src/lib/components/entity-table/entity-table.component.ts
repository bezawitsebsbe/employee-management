import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, TemplateRef, ChangeDetectorRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { Subject } from 'rxjs';

import {
  EntityColumn,
  EntitySetting,
  EntityConfig,
  EntityTableData,
  SortEvent,
  PaginationEvent,
  GroupEvent,
  ViewMode
} from '../../models/entity-model';

@Component({
  selector: 'app-entity-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzDropDownModule,
    NzTooltipModule,
    NzInputModule,
    NzTagModule,
    NzAvatarModule,
    NzSelectModule,
    NzTabsModule
  ],
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.scss']
})
export class EntityTableComponent implements OnInit, OnDestroy {
  @Input() data: EntityTableData = { items: [] };
  @Input() config: EntityConfig = {};
  @Input() setting: EntitySetting = {
  visibleColumns: [],
  primaryColumn: {
    key: 'id',
    name: 'ID',
    label: 'ID',
    type: 'text',
    hideSort: false,
    tdClass: '',
    onChild: false
  },
  showTabs: true,  // ✅ Changed to true by default
  showFilters: true  // ✅ Changed to true by default
};
  @Input() viewMode: ViewMode = { mode: 'list', label: 'List' };

  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() currentPageDataChange = new EventEmitter<any[]>();
  @Output() action = new EventEmitter<{ action: string; data: any }>();
  @Output() filtersChange = new EventEmitter<any>();
  @Output() paginationChange = new EventEmitter<PaginationEvent>();
  @Output() groupChange = new EventEmitter<GroupEvent>();
  @Output() checkAllChange = new EventEmitter<boolean>();
  @Output() itemCheckChange = new EventEmitter<{ id: string; checked: boolean }>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() edit = new EventEmitter<any>();
  @Output() delete = new EventEmitter<any>();

  @Input() loading = false;

  @ViewChild('row') table: any;

  // Form controls
  searchControl = new FormControl('');
  departmentControl = new FormControl('');
  statusControl = new FormControl('');
  selectedGroupControl = new FormControl('');
  selectedFavoriteControl = new FormControl('');

  // View states
  treeView = false;
  searchTerm = '';
  departmentFilter = '';
  statusFilter = '';
  activeTab = 0;
  mapOfCheckedId: { [key: string]: boolean } = {};
  isIndeterminate = false;
  allChecked = false;

  // Templates
  @ContentChild('cellTemplate') cellTemplate: TemplateRef<any> | null = null;
  @ContentChild('childViewCellTemplate') childViewCellTemplate: TemplateRef<any> | null = null;

  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  // Helper methods for filter changes
  onGroupChange(value: string | null): void {
    this.groupChange.emit({ group: value || '' });
  }

  onFavoriteChange(value: string | null): void {
    // Handle favorite filter logic
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.departmentFilter = '';
    this.statusFilter = '';
    this.activeTab = 0;
    this.applyFilters();
  }

  // Helper method to get identity key consistently
  getIdentityKey(): string {
    return this.setting?.identity || this.config?.identity || 'id';
  }

  // Public getter for template access
  get idKey(): string {
    return this.getIdentityKey();
  }

  ngOnInit(): void {
    this.initializeDefaults();

    this.searchControl.valueChanges.subscribe(value => {
      this.searchTerm = value || '';
      this.applyFilters();
    });

    this.departmentControl.valueChanges.subscribe(value => {
      this.departmentFilter = value || '';
      this.applyFilters();
    });

    this.statusControl.valueChanges.subscribe(value => {
      this.statusFilter = value || '';
      this.applyFilters();
    });

    this.selectedGroupControl.valueChanges.subscribe(value => {
      this.onGroupChange(value);
    });

    this.selectedFavoriteControl.valueChanges.subscribe(value => {
      this.onFavoriteChange(value);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeDefaults(): void {
    this.config = {
      title: this.config.title || 'Entities',
      searchable: this.config.searchable !== false,
      paginated: this.config.paginated !== false,
      pageSize: this.config.pageSize || 10,
      showSizeChanger: this.config.showSizeChanger !== false,
      frontPagination: this.config.frontPagination !== false,
      loading: this.config.loading || false,
      otherView: this.config.otherView || false,
      useClickHandler: this.config.useClickHandler || false,
      detailUrl: this.config.detailUrl || 'detail',
      showDetail: this.config.showDetail || false,
      detailTemplate: this.config.detailTemplate || null,
      primaryColumn: this.config.primaryColumn || {
        key: 'id',
        name: 'ID',
        label: 'ID',
        type: 'text',
        hideSort: false,
        tdClass: '',
        onChild: false
      }
    };

    this.setting = {
      title: this.setting.title || 'Entities',
      searchable: this.setting.searchable !== false,
      paginated: this.setting.paginated !== false,
      pageSize: this.setting.pageSize || 10,
      showSizeChanger: this.setting.showSizeChanger !== false,
      frontPagination: this.setting.frontPagination !== false,
      loading: this.setting.loading || false,
      otherView: this.setting.otherView || false,
      useClickHandler: this.setting.useClickHandler || false,
      detailUrl: this.setting.detailUrl || 'detail',
      visibleColumns: this.setting.visibleColumns || [],
      showTabs: this.setting.showTabs !== false,  // ✅ Preserve showTabs setting
      showFilters: this.setting.showFilters !== false,  // ✅ Preserve showFilters setting
      tabType: this.setting.tabType || 'employee',  // ✅ Preserve tabType setting
      primaryColumn: this.setting.primaryColumn || {
        key: 'id',
        name: 'ID',
        label: 'ID',
        type: 'text',
        hideSort: false,
        tdClass: '',
        onChild: false
      }
    };
  }

  // Table events
  sort(event: Event): void {
    // Extract SortEvent properties from the Event
    const sortEvent = {
      key: (event as any).key || (event as any).columnKey,
      value: (event as any).value
    } as SortEvent;
    this.sortChange.emit(sortEvent);
  }

  onPaginationChange(event: PaginationEvent): void {
    this.paginationChange.emit(event);
  }

  handleCurrentPageDataChange(data: readonly any[]): void {
    this.currentPageDataChange.emit(data as any[]);
  }

  // Checkbox handling
  checkAll(value: boolean): void {
    if (!this.setting) return;
    
    this.data.items.forEach(item => {
      this.mapOfCheckedId[item[this.setting?.identity || 'id']] = value;
    });
    this.refreshStatus();
    this.checkAllChange.emit(value);
  }

  refreshStatus(): void {
    if (!this.setting) return;

    const allChecked = this.data.items.every(item => 
      this.mapOfCheckedId[item[this.setting?.identity || 'id']]
    );
    const allUnChecked = this.data.items.every(item => 
      !this.mapOfCheckedId[item[this.config?.identity || 'id']]
    );
    
    this.allChecked = allChecked;
    this.isIndeterminate = !allChecked && !allUnChecked;
    this.cdr.detectChanges();
  }

  onItemCheckChange(id: string, checked: boolean): void {
    this.mapOfCheckedId[id] = checked;
    this.refreshStatus();
    this.itemCheckChange.emit({ id, checked });
  }

  // Group handling
  onGroup(group: string): void {
    this.groupChange.emit({ group });
  }

  // View mode toggle
  toggleTreeView(): void {
    this.treeView = !this.treeView;
  }

  // Action handling
  onEntityAction(actionKey: string, data: any): void {
    this.action.emit({ action: actionKey, data });
  }

  onItemClick(item: any, event: Event): void {
    if (this.config?.onItemClick) {
      this.config.onItemClick(item, event);
    }
  }

  // Routing
  getRouting(item: any): string[] {
    if (this.config?.routing) {
      return this.config.routing(item);
    }
    return [this.config.detailUrl || 'detail', item[this.idKey]];
  }

  // Track by function
  trackBy(index: number, item: any): string {
    return item[this.idKey] || index;
  }

  // Get display value for column
  getDisplayValue(item: any, column: EntityColumn): string {
    const value = item[column.key];
    
    if (value === null || value === undefined) {
      return '';
    }

    if (column.isDate) {
      return new Date(value).toLocaleDateString();
    }

    if (column.isBoolean && column.booleanValue) {
      return value ? column.booleanValue.true : column.booleanValue.false;
    }

    return value.toString();
  }

  // Check if action is disabled
  isActionDisabled(action: any, item: any): boolean {
    return action.disabled ? action.disabled(item) : false;
  }

  // Get visible columns
  get visibleColumns(): EntityColumn[] {
    return this.setting?.visibleColumns || [];
  }

  // Get checked items
  get checkedItems(): any[] {
    if (!this.setting) return [];
    
    return this.data.items.filter(item => 
      this.mapOfCheckedId[item[this.setting?.identity || 'id']]
    );
  }

  // Search handling
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filtersChange.emit({
      search: searchTerm
    });
    this.cdr.detectChanges();
  }

  // Pagination handling
  onPageIndexChange(pageIndex: number): void {
    this.paginationChange.emit({
      pageIndex: pageIndex + 1, // Convert from 0-based to 1-based
      pageSize: this.data.pageSize || this.config.pageSize || 10
    });
  }

  onPageSizeChange(pageSize: number): void {
    this.paginationChange.emit({
      pageIndex: 1, // Reset to first page
      pageSize: pageSize
    });
  }

  // Track by for columns
  trackByColumn(index: number, column: EntityColumn): string {
    return column.key;
  }

  // Track by for fields
  trackByField(index: number, field: EntityColumn): string {
    return field.key;
  }

  // Loading state
  get itemsLoading(): boolean {
    return this.data.loading || this.config.loading || false;
  }

  // Event handlers
  onRowClick(row: any): void {
    this.rowClick.emit(row);
  }

  onEdit(row: any): void {
    this.edit.emit(row);
  }

  onDelete(row: any): void {
    this.delete.emit(row);
  }

  // Enhanced filter methods
  onDepartmentFilterChange(department: string): void {
    this.departmentFilter = department;
    this.applyFilters();
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  onTabChange(index: number): void {
    this.activeTab = index;
    this.applyFilters();
  }

  private applyFilters(): void {
    const filters: any = {
      search: this.searchTerm,
      department: this.departmentFilter,
      status: this.statusFilter,
      activeTab: this.activeTab
    };

    // Emit filter changes for parent component to handle
    this.filtersChange.emit(filters);
  }

  // Get filtered items based on active tab
  getFilteredItems(): any[] {
    let items = [...this.data.items];

    // Filter by tab type
    if (this.setting.tabType === 'attendance') {
      // Attendance tabs: All, Present, Absent
      if (this.activeTab === 1) {
        // Present tab
        items = items.filter(item => item.status === 'Present');
      } else if (this.activeTab === 2) {
        // Absent tab
        items = items.filter(item => item.status === 'Absent' || item.status === 'Late');
      }
      // Tab 0 (All) shows all items
    } else {
      // Employee tabs: Active, Inactive
      if (this.activeTab === 0) {
        // Active employees tab
        items = items.filter(item => item.status === 'Active');
      } else if (this.activeTab === 1) {
        // Inactive employees tab
        items = items.filter(item => item.status === 'Inactive' || item.status === 'On Leave');
      }
    }

    // Apply search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      items = items.filter(item => 
        (item.fullName && item.fullName.toLowerCase().includes(searchLower)) ||
        (item.email && item.email.toLowerCase().includes(searchLower)) ||
        (item.empId && item.empId.toLowerCase().includes(searchLower)) ||
        (item.department && item.department.toLowerCase().includes(searchLower)) ||
        (item.position && item.position.toLowerCase().includes(searchLower))
      );
    }

    // Apply department filter
    if (this.departmentFilter) {
      items = items.filter(item => item.department === this.departmentFilter);
    }

    // Apply status filter
    if (this.statusFilter) {
      items = items.filter(item => item.status === this.statusFilter);
    }

    return items;
  }

  // Get unique departments for filter dropdown
  getUniqueDepartments(): string[] {
    const departments = [...new Set(this.data.items.map(item => item.department).filter(Boolean))];
    return departments.sort();
  }

  // Get unique statuses for filter dropdown
  getUniqueStatuses(): string[] {
    const statuses = [...new Set(this.data.items.map(item => item.status).filter(Boolean))];
    return statuses.sort();
  }
}
