import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ViewChild, TemplateRef, ChangeDetectorRef, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { NzInputModule } from 'ng-zorro-antd/input';
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
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzCheckboxModule,
    NzIconModule,
    NzDropDownModule,
    NzTooltipModule,
    NzInputModule
  ],
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.scss']
})
export class EntityTableComponent implements OnInit, OnDestroy {
  @Input() data: EntityTableData = { items: [] };
  @Input() setting: EntitySetting | null = null;
  @Input() config: EntityConfig = {};
  @Input() viewMode: ViewMode = { mode: 'list', label: 'List' };

  @Output() sortChange = new EventEmitter<SortEvent>();
  @Output() currentPageDataChange = new EventEmitter<any[]>();
  @Output() paginationChange = new EventEmitter<PaginationEvent>();
  @Output() groupChange = new EventEmitter<GroupEvent>();
  @Output() checkAllChange = new EventEmitter<boolean>();
  @Output() itemCheckChange = new EventEmitter<{ id: string; checked: boolean }>();

  @ViewChild('row') table: any;

  // View states
  treeView = false;
  searchTerm = '';
  mapOfCheckedId: { [key: string]: boolean } = {};
  isIndeterminate = false;
  allChecked = false;

  // Templates
  @ContentChild('cellTemplate') cellTemplate: TemplateRef<any> | null = null;
  @ContentChild('childViewCellTemplate') childViewCellTemplate: TemplateRef<any> | null = null;

  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.initializeDefaults();
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
      detailUrl: this.config.detailUrl || 'detail'
    };
  }

  // Table events
  sort(event: SortEvent): void {
    this.sortChange.emit(event);
  }

  onPaginationChange(event: PaginationEvent): void {
    this.paginationChange.emit(event);
  }

  handleCurrentPageDataChange(data: any[]): void {
    this.currentPageDataChange.emit(data);
  }

  // Checkbox handling
  checkAll(value: boolean): void {
    if (!this.setting) return;
    
    this.data.items.forEach(item => {
      this.mapOfCheckedId[item[this.setting!.identity]] = value;
    });
    this.refreshStatus();
    this.checkAllChange.emit(value);
  }

  refreshStatus(): void {
    if (!this.setting) return;

    const allChecked = this.data.items.every(item => 
      this.mapOfCheckedId[item[this.setting!.identity]]
    );
    const allUnChecked = this.data.items.every(item => 
      !this.mapOfCheckedId[item[this.setting!.identity]]
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
  onItemClick(item: any, event: Event): void {
    if (this.setting?.onItemClick) {
      this.setting.onItemClick(item, event);
    }
  }

  // Routing
  getRouting(item: any): string[] {
    if (this.setting?.routing) {
      return this.setting.routing(item);
    }
    return [this.config.detailUrl || 'detail', item[this.setting!.identity]];
  }

  // Track by function
  trackBy(index: number, item: any): string {
    return item[this.setting?.identity || 'id'] || index;
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
    return this.setting?.visibleColumn || [];
  }

  // Get checked items
  get checkedItems(): any[] {
    if (!this.setting) return [];
    
    return this.data.items.filter(item => 
      this.mapOfCheckedId[item[this.setting!.identity]]
    );
  }

  // Search handling
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    // Emit search event or filter data
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
}
