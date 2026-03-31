export interface EntityColumn {
  key: string;
  name: string;
  label: string;
  type: 'text' | 'avatar' | 'tag' | 'date' | 'number' | 'boolean' | 'select' | 'email';
  width?: string;
  sortable?: boolean;
  thWidth?: string;
  tdClass?: string;
  hideSort?: boolean;
  template?: any; // ng-template reference
  prefix?: EntityColumnPrefix;
  suffix?: EntityColumnSuffix;
  onChild?: boolean;
  hasLocale?: boolean;
  hasTranslate?: boolean;
  isDate?: boolean;
  isNumber?: boolean;
  isBoolean?: boolean;
  booleanValue?: {
    true: string;
    false: string;
  };
  precision?: string;
  tagColors?: Record<string, string>;
  options?: string[];
  placeholder?: string;
  required?: boolean;
}

export interface EntityColumnPrefix {
  tdClass?: string;
  key: string;
  hasLocale?: boolean;
  hasTranslate?: boolean;
  isDate?: boolean;
  isNumber?: boolean;
  isBoolean?: boolean;
  booleanValue?: {
    true: string;
    false: string;
  };
  precision?: string;
}

export interface EntityColumnSuffix {
  tdClass?: string;
  key: string;
  hasLocale?: boolean;
  hasTranslate?: boolean;
  isDate?: boolean;
  isNumber?: boolean;
  isBoolean?: boolean;
  booleanValue?: {
    true: string;
    false: string;
  };
  precision?: string;
}

export interface EntityAction {
  key: string;
  label: string;
  icon?: string;
  type: 'view' | 'edit' | 'delete' | 'custom' | 'primary' | 'danger';
  callback?: (entity: any) => void;
  disabled?: (entity: any) => boolean;
  routerLink?: (entity: any) => string[];
  visible?: (entity: any) => boolean;
}

export interface EntitySetting {
  title?: string;
  searchable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  showSizeChanger?: boolean;
  frontPagination?: boolean;
  loading?: boolean;
  otherView?: boolean;
  useClickHandler?: boolean;
  detailUrl?: string;
  columns?: EntityColumn[];
  actions?: EntityAction[];
  identity?: string; // Primary key field name
  visibleColumns?: EntityColumn[];
  showDetail?: boolean;
  primaryColumn: EntityColumn;
  group?: string[];
  favorite?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  showTabs?: boolean;
  showFilters?: boolean;
  tabType?: 'employee' | 'attendance';
  onItemClick?: (data: any, event: Event) => void;
  routing?: (data: any) => string[];
  detailTemplate?: any; // ng-template reference
  settings?: {
    showSearch?: boolean;
    showPagination?: boolean;
    showSizeChanger?: boolean;
    pageSize?: number;
    frontPagination?: boolean;
  };
}

export interface EntityConfig {
  title?: string;
  searchable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  showSizeChanger?: boolean;
  frontPagination?: boolean;
  loading?: boolean;
  otherView?: boolean;
  useClickHandler?: boolean;
  detailUrl?: string;
  columns?: EntityColumn[];
  actions?: EntityAction[];
  showFilters?: boolean;
  showTabs?: boolean;
  identity?: string;
  primaryColumn?: EntityColumn;
  visibleColumn?: EntityColumn[];
  showDetail?: boolean;
  group?: string[];
  favorite?: boolean;
  selectable?: boolean;
  onItemClick?: (data: any, event: Event) => void;
  routing?: (data: any) => string[];
  detailTemplate?: any; // ng-template reference
  settings?: {
    showSearch?: boolean;
    showPagination?: boolean;
    showSizeChanger?: boolean;
    pageSize?: number;
    frontPagination?: boolean;
  };
}

export interface ViewMode {
  mode: 'list' | 'detail';
  label: string;
}

export interface EntityTableData {
  items: any[];
  totalItems?: number;
  currentPage?: number;
  pageSize?: number;
  loading?: boolean;
}

export interface SortEvent {
  key: string;
  value: 'ascend' | 'descend' | null;
}

export interface PaginationEvent {
  pageIndex: number;
  pageSize: number;
}

export interface GroupEvent {
  group: string;
}