export interface EntityColumn {
  key: string;
  name: string;
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
  label: string;
  icon?: string;
  type: 'view' | 'edit' | 'delete' | 'custom';
  callback?: (entity: any) => void;
  disabled?: (entity: any) => boolean;
  routerLink?: (entity: any) => string[];
}

export interface EntitySetting {
  visibleColumn: EntityColumn[];
  actions?: EntityAction[];
  showDetail?: boolean;
  identity: string; // Primary key field name
  onItemClick?: (data: any, event: Event) => void;
  routing?: (data: any) => string[];
  useClickHandler?: boolean;
  detailTemplate?: any; // ng-template reference
  detailUrl?: string;
  primaryColumn: EntityColumn;
  group?: string[];
  favorite?: boolean;
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